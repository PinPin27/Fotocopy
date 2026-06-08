import { useEffect, useState } from 'react';
import { Order } from '../types';
import { apiUrl } from '../lib/api';

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch(apiUrl('/api/orders'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
      <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">Dokumen</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Antrian</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Total Harga</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900">
                  {order.document_url}
                  <div className="text-xs text-slate-500 font-normal">{order.pages} Hal | {order.color_type} | {order.binding_type}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    No. {order.queue_number}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">Rp {order.total_price.toLocaleString()}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {order.status}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-slate-500">Belum ada pesanan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
