import { useEffect, useState } from 'react';
import { Clock, Printer, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

const queueStatuses: Order['status'][] = ['Waiting Queue', 'In Process', 'Printing', 'Completed', 'Cancelled'];

export default function AdminQueue() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = () => {
    setLoading(true);
    fetch(apiUrl('/api/admin/queue'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    await fetch(apiUrl(`/api/orders/${id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchQueue();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Management</h1>
          <p className="text-sm text-slate-500">Pantau dan ubah status antrian cetak aktif.</p>
        </div>
        <button
          onClick={fetchQueue}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Queue</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Printing</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{orders.filter(order => order.status === 'Printing').length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Estimated Work</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {orders.reduce((sum, order) => sum + (order.estimated_time || 0), 0)}m
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Queue</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Document</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Estimate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-4">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
                    <Printer className="h-4 w-4" />
                    #{String(order.queue_number || 0).padStart(3, '0')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">{order.customer_name}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">{order.document_url}</p>
                  <p className="text-xs text-slate-400">{order.pages} hal | {order.quantity} pcs | {order.color_type}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {order.estimated_time || 0} menit
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-bold',
                    order.status === 'Printing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'In Process' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-slate-100 text-slate-700'
                  )}>
                    {order.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <select
                    value={order.status}
                    onChange={event => updateStatus(order.id, event.target.value as Order['status'])}
                    className="rounded-md border-0 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600"
                  >
                    {queueStatuses.map(status => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada antrian aktif.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
