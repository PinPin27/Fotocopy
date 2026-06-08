import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, CreditCard, Printer, RefreshCw, Search } from 'lucide-react';
import { Order, Payment } from '../types';
import { cn } from '../lib/utils';

const orderStatuses: Order['status'][] = [
  'Waiting Payment',
  'Waiting Queue',
  'In Process',
  'Printing',
  'Completed',
  'Cancelled',
];

const paymentStatuses: Payment['status'][] = ['Unpaid', 'Pending', 'Paid', 'Rejected'];

const statusTone: Record<Order['status'], string> = {
  'Waiting Payment': 'bg-amber-100 text-amber-800',
  'Waiting Queue': 'bg-indigo-100 text-indigo-800',
  'In Process': 'bg-blue-100 text-blue-800',
  Printing: 'bg-cyan-100 text-cyan-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const paymentTone: Record<Payment['status'], string> = {
  Unpaid: 'bg-slate-100 text-slate-700',
  Pending: 'bg-blue-100 text-blue-800',
  Paid: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Order['status']>('All');

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  const fetchOperations = async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersRes, paymentsRes] = await Promise.all([
        fetch('/api/orders', { headers: authHeaders }),
        fetch('/api/admin/payments', { headers: authHeaders }),
      ]);

      if (!ordersRes.ok) throw new Error('Gagal memuat data order.');
      if (!paymentsRes.ok) throw new Error('Gagal memuat data pembayaran.');

      const [ordersData, paymentsData] = await Promise.all([
        ordersRes.json(),
        paymentsRes.json(),
      ]);

      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
      setPayments(Array.isArray(paymentsData.payments) ? paymentsData.payments : []);
    } catch (err) {
      setOrders([]);
      setPayments([]);
      setError(err instanceof Error ? err.message : 'Gagal memuat data operasional.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const paymentsByOrder = useMemo(() => {
    return new Map(payments.map(payment => [payment.order_id, payment]));
  }, [payments]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter(order => {
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesQuery = !normalizedQuery
        || order.document_url.toLowerCase().includes(normalizedQuery)
        || (order.customer_name || '').toLowerCase().includes(normalizedQuery)
        || String(order.queue_number || '').includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const activeOrders = orders.filter(order => order.status !== 'Completed' && order.status !== 'Cancelled');
  const waitingPayments = payments.filter(payment => payment.status !== 'Paid').length;
  const activeQueue = orders.filter(order => ['Waiting Queue', 'In Process', 'Printing'].includes(order.status)).length;

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ status }),
    });
    fetchOperations();
  };

  const updatePaymentStatus = async (id: string, status: Payment['status']) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ status }),
    });
    fetchOperations();
  };

  const markOrderDone = async (orderId: string, payment?: Payment) => {
    setError('');

    try {
      const orderRes = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ status: 'Completed' }),
      });

      if (!orderRes.ok) throw new Error('Gagal menandai order sebagai selesai.');

      if (payment) {
        const paymentRes = await fetch(`/api/admin/payments/${payment.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({ status: 'Paid' }),
        });

        if (!paymentRes.ok) throw new Error('Order selesai, tapi pembayaran gagal ditandai Paid.');
      }

      fetchOperations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tombol selesai gagal diproses.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Operations</h1>
          <p className="text-sm text-slate-500">Update order, antrian, dan pembayaran dari satu tempat.</p>
        </div>
        <button
          onClick={fetchOperations}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error} Cek koneksi database/server.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Printer className="h-4 w-4" />
            Total Orders
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Clock className="h-4 w-4" />
            Active Queue
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{activeQueue}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <CreditCard className="h-4 w-4" />
            Need Payment
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{waitingPayments}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            Active Work
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{activeOrders.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Cari customer, dokumen, atau nomor antrian"
            className="h-10 w-full rounded-md border-0 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value as 'All' | Order['status'])}
          className="h-10 rounded-md border-0 bg-white px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600"
        >
          <option value="All">Semua Status</option>
          {orderStatuses.map(status => <option key={status}>{status}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Order</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Antrian</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Harga</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status Order</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Pembayaran</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map(order => {
              const payment = paymentsByOrder.get(order.id);

              return (
                <tr key={order.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-4 text-sm">
                    <p className="font-semibold text-slate-900">{order.customer_name || 'Customer'}</p>
                    <p className="mt-1 font-medium text-slate-700">{order.document_url}</p>
                    <p className="text-xs text-slate-400">{order.pages} hal | {order.quantity} pcs | {order.color_type} | {order.paper_type}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 font-bold text-indigo-700">
                      <Printer className="h-4 w-4" />
                      {order.queue_number ? `#${String(order.queue_number).padStart(3, '0')}` : 'Selesai'}
                    </span>
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {order.estimated_time || 0} menit
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-slate-900">
                    Rp {Number(order.total_price || 0).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', statusTone[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {payment ? (
                      <div className="space-y-2">
                        <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', paymentTone[payment.status])}>
                          {payment.status}
                        </span>
                        <p className="text-xs text-slate-500">{payment.method}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Belum ada data</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-56 flex-col gap-2">
                      <button
                        type="button"
                        disabled={order.status === 'Completed'}
                        onClick={() => markOrderDone(order.id, payment)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-green-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Selesai
                      </button>
                      <select
                        value={order.status}
                        onChange={event => updateOrderStatus(order.id, event.target.value as Order['status'])}
                        className="h-9 rounded-md border-0 bg-white px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600"
                      >
                        {orderStatuses.map(status => <option key={status}>{status}</option>)}
                      </select>
                      <select
                        value={payment?.status || 'Unpaid'}
                        disabled={!payment}
                        onChange={event => payment && updatePaymentStatus(payment.id, event.target.value as Payment['status'])}
                        className="h-9 rounded-md border-0 bg-white px-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {paymentStatuses.map(status => <option key={status}>{status}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                  Tidak ada order yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
