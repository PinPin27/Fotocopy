import { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, ShieldCheck } from 'lucide-react';
import { Payment } from '../types';
import { cn } from '../lib/utils';

const paymentStatuses: Payment['status'][] = ['Unpaid', 'Pending', 'Paid', 'Rejected'];

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    setLoading(true);
    fetch('/api/admin/payments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setPayments(data.payments || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const updatePayment = async (id: string, status: Payment['status']) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Verification</h1>
          <p className="text-sm text-slate-500">Kelola status pembayaran dari setiap pesanan.</p>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {paymentStatuses.map(status => (
          <div key={status} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{status}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{payments.filter(payment => payment.status === status).length}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Order</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Method</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Payment</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <p className="font-semibold text-slate-900">{payment.customer_name}</p>
                  <p className="text-xs text-slate-400">{payment.customer_email}</p>
                </td>
                <td className="px-4 py-4 text-sm">
                  <p className="font-semibold text-slate-800">{payment.document_url}</p>
                  <p className="text-xs text-slate-400">{payment.order_status}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    {payment.method}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-slate-900">Rp {Number(payment.total_price).toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                    payment.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    payment.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    payment.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  )}>
                    {payment.status === 'Paid' && <ShieldCheck className="h-3 w-3" />}
                    {payment.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <select
                    value={payment.status}
                    onChange={event => updatePayment(payment.id, event.target.value as Payment['status'])}
                    className="rounded-md border-0 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600"
                  >
                    {paymentStatuses.map(status => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada data pembayaran.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
