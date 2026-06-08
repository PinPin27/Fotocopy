import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL belum diset. Tambahkan environment variable DATABASE_URL di Render.');
}

// Menggunakan koneksi Pool dari Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const initDB = async () => {
  let client;
  try {
    client = await pool.connect();
    
    // Migration script - Create necessary tables (Syntax disesuaikan untuk Postgres)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        base_price INTEGER NOT NULL,
        type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Waiting Payment',
        total_price INTEGER NOT NULL,
        queue_number INTEGER,
        estimated_time INTEGER,
        document_url TEXT NOT NULL,
        pages INTEGER NOT NULL,
        color_type TEXT NOT NULL,
        paper_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        binding_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Unpaid',
        proof_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Insert default admin
    const adminRes = await client.query("SELECT count(*) as count FROM users WHERE role = 'admin'");
    if (parseInt(adminRes.rows[0].count) === 0) {
      await client.query(
        "INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)",
        ['admin-1', 'Super Admin', 'admin@fotocopy.com', '$2b$10$e.w2T6mTb3O/z.kM4hL89.A4bWfBxUExx3yXYR6m0o/Q8sVfOqZRO', 'admin']
      );
    }
    
    console.log("Database PostgreSQL berhasil diinisialisasi! 🚀");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Gagal inisialisasi database: ${message}`);
    console.error("Cek environment variable DATABASE_URL di Render dan pastikan URL koneksi Supabase benar.");
    throw err;
  } finally {
    client?.release();
  }
};

export const checkDB = async () => {
  await pool.query('SELECT 1');
};

export default pool;
