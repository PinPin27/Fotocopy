import express from 'express';
import pool from './db.ts'; // Ganti dari db jadi pool
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-copy-key';

// Middleware for authentication
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const createNotification = async (userId: string, title: string, message: string) => {
  await pool.query(
    'INSERT INTO notifications (id, user_id, title, message) VALUES ($1, $2, $3, $4)',
    [Math.random().toString(36).substring(7), userId, title, message]
  );
};

const normalizeActiveQueue = async () => {
  await pool.query("UPDATE orders SET queue_number = NULL WHERE status IN ('Completed', 'Cancelled')");

  const result = await pool.query(`
    SELECT id
    FROM orders
    WHERE status NOT IN ('Completed', 'Cancelled')
    ORDER BY created_at ASC, id ASC
  `);

  await Promise.all(result.rows.map((order, index) => (
    pool.query('UPDATE orders SET queue_number = $1 WHERE id = $2', [index + 1, order.id])
  )));
};

// Auth
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    // For demo if password matches exactly or the hashed one (admin)
    if (password !== user.password && user.password !== '$2b$10$e.w2T6mTb3O/z.kM4hL89.A4bWfBxUExx3yXYR6m0o/Q8sVfOqZRO') {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const id = Math.random().toString(36).substring(7);
  try {
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)', 
      [id, name, email, password]
    );
    res.json({ message: 'User registered successfully' });
  } catch (err: any) {
    res.status(400).json({ error: 'Registration failed. Email might exist.' });
  }
});

// User orders
router.get('/orders', authenticate, async (req: any, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      const result = await pool.query(`
        SELECT o.*, u.name as customer_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY
          CASE WHEN o.status IN ('Completed', 'Cancelled') THEN 1 ELSE 0 END,
          o.queue_number ASC NULLS LAST,
          o.created_at ASC
      `);
      orders = result.rows;
    } else {
      const result = await pool.query(`
        SELECT *
        FROM orders
        WHERE user_id = $1
        ORDER BY
          CASE WHEN status IN ('Completed', 'Cancelled') THEN 1 ELSE 0 END,
          queue_number ASC NULLS LAST,
          created_at ASC
      `, [req.user.id]);
      orders = result.rows;
    }
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/orders', authenticate, async (req: any, res) => {
  const o = req.body;
  const id = Math.random().toString(36).substring(7);
  
  // Calculate price logic
  let basePrice = o.pages * o.quantity * (o.color_type === 'Color' ? 1500 : 500);
  let bindingPrice = o.binding_type === 'Tanpa Jilid' ? 0 : (o.binding_type === 'Soft Cover' ? 15000 : 25000);
  let total = basePrice + bindingPrice;

  try {
    // Generate Queue Number
    const queueRes = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('Completed', 'Cancelled')");
    const nextQ = Number(queueRes.rows[0].count || 0) + 1;
    const estTime = (o.pages * o.quantity / 20) + (o.binding_type === 'Tanpa Jilid' ? 0 : 30); // minutes

    await pool.query(`
      INSERT INTO orders (id, user_id, document_url, pages, color_type, paper_type, quantity, binding_type, total_price, queue_number, estimated_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [id, req.user.id, o.document_url || 'dummy.pdf', o.pages, o.color_type, o.paper_type, o.quantity, o.binding_type, total, nextQ, Math.ceil(estTime)]);

    await pool.query(
      'INSERT INTO payments (id, order_id, method) VALUES ($1, $2, $3)', 
      [Math.random().toString(36).substring(7), id, 'Transfer']
    );

    await createNotification(
      req.user.id,
      'Pesanan berhasil dibuat',
      `Pesanan ${o.document_url || 'dummy.pdf'} masuk ke antrian #${String(nextQ).padStart(3, '0')}.`
    );

    res.json({ message: 'Order created', id, queue_number: nextQ, total_price: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.patch('/orders/:id/status', authenticate, isAdmin, async (req: any, res) => {
  const { status } = req.body;
  try {
    const orderRes = await pool.query('SELECT user_id, document_url FROM orders WHERE id = $1', [req.params.id]);
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    const order = orderRes.rows[0];
    if (status === 'Completed') {
      await pool.query("UPDATE payments SET status = 'Paid' WHERE order_id = $1", [req.params.id]);
    }
    if (status === 'Completed' || status === 'Cancelled') {
      await normalizeActiveQueue();
    }
    if (order) {
      await createNotification(
        order.user_id,
        'Status pesanan diperbarui',
        `Pesanan ${order.document_url} sekarang berstatus ${status}.`
      );
    }
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.patch('/orders/:id/done', authenticate, isAdmin, async (req: any, res) => {
  try {
    const orderRes = await pool.query('SELECT user_id, document_url FROM orders WHERE id = $1', [req.params.id]);
    const order = orderRes.rows[0];

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await pool.query("UPDATE orders SET status = 'Completed' WHERE id = $1", [req.params.id]);
    await pool.query("UPDATE payments SET status = 'Paid' WHERE order_id = $1", [req.params.id]);
    await normalizeActiveQueue();

    await createNotification(
      order.user_id,
      'Pesanan selesai',
      `Pesanan ${order.document_url} sudah selesai dan pembayaran ditandai Paid.`
    );

    res.json({ message: 'Order completed' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/admin/queue', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status NOT IN ('Completed', 'Cancelled', 'Waiting Payment')
      ORDER BY o.queue_number ASC NULLS LAST, o.created_at ASC
    `);
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/admin/payments', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        o.document_url,
        o.total_price,
        o.status as order_status,
        u.name as customer_name,
        u.email as customer_email
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      ORDER BY
        CASE WHEN o.status IN ('Completed', 'Cancelled') THEN 1 ELSE 0 END,
        o.queue_number ASC NULLS LAST,
        o.created_at ASC
    `);
    res.json({ payments: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.patch('/admin/payments/:id', authenticate, isAdmin, async (req: any, res) => {
  const { status } = req.body;
  try {
    const paymentRes = await pool.query(`
      SELECT p.order_id, o.user_id, o.document_url
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.id = $1
    `, [req.params.id]);

    await pool.query('UPDATE payments SET status = $1 WHERE id = $2', [status, req.params.id]);

    const payment = paymentRes.rows[0];
    if (payment) {
      if (status === 'Paid') {
        await pool.query("UPDATE orders SET status = 'Waiting Queue' WHERE id = $1 AND status = 'Waiting Payment'", [payment.order_id]);
        await normalizeActiveQueue();
      }

      await createNotification(
        payment.user_id,
        'Status pembayaran diperbarui',
        `Pembayaran untuk ${payment.document_url} sekarang berstatus ${status}.`
      );
    }

    res.json({ message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/notifications', authenticate, async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.patch('/notifications/read-all', authenticate, async (req: any, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Dashboard stats for admin
router.get('/admin/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalRevRes = await pool.query("SELECT SUM(total_price) as sum FROM orders WHERE status = 'Completed'");
    const totalRevenue = totalRevRes.rows[0].sum || 0;
    
    const activeOrdersRes = await pool.query("SELECT COUNT(*) as c FROM orders WHERE status NOT IN ('Completed', 'Cancelled')");
    const activeOrders = activeOrdersRes.rows[0].c;
    
    const completedOrdersRes = await pool.query("SELECT COUNT(*) as c FROM orders WHERE status = 'Completed'");
    const completedOrders = completedOrdersRes.rows[0].c;
    
    res.json({
      totalRevenue,
      activeOrders,
      completedOrders
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
