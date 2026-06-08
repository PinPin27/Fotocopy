import { useEffect, useState } from 'react';
import { User, Order } from '../types';
import { Upload } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

export default function CustomerDashboard({ user }: { user: User | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/orders'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat pesanan.');
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setError('');
      })
      .catch(() => {
        setOrders([]);
        setError('Pesanan belum bisa dimuat. Cek koneksi database/server.');
      });
  }, []);

  const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
  const topActiveOrder = activeOrders[0];

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Selamat Pagi, {user?.name?.split(' ')[0] || 'User'} 👋</h2>
          <p className="text-slate-500">Siap untuk mencetak dokumen hari ini?</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Sistem Online: Lancar</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(120px,auto)] md:grid-rows-6 gap-6 min-h-0 flex-1 pb-8">
        
        {/* Antrian Saat Ini (8x3) */}
        <div className="col-span-1 md:col-span-8 md:row-span-3 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold">Antrian Saat Ini</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
              {topActiveOrder ? topActiveOrder.status : 'NO ACTIVE ORDER'}
            </span>
          </div>
          {topActiveOrder ? (
            <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 w-full md:w-auto text-center md:text-left">
                <div className="flex flex-col md:flex-row items-baseline gap-2 justify-center md:justify-start">
                  <span className="text-6xl md:text-7xl font-black text-indigo-600">
                    #{String(topActiveOrder.queue_number).padStart(3, '0')}
                  </span>
                  <span className="text-slate-400">Antrian Anda</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 italic">Sedang diproses</p>
                  <div className="w-full md:w-64 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%]"></div>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl inline-block text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-widest block">Estimasi Selesai</p>
                  <p className="text-2xl font-bold text-slate-700">{topActiveOrder.estimated_time} Menit</p>
                </div>
                <div className="flex gap-3 justify-center md:justify-end items-center">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs uppercase shrink-0">
                    {topActiveOrder.document_url.split('.').pop() || 'DOC'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold truncate max-w-[120px] md:max-w-xs">{topActiveOrder.document_url}</p>
                    <p className="text-xs text-slate-400">{topActiveOrder.pages} Hal • {topActiveOrder.color_type}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Belum ada pesanan aktif
            </div>
          )}
        </div>

        {/* Upload Button (4x3) */}
        <div className="col-span-1 md:col-span-4 md:row-span-3 bg-green-500 rounded-3xl p-8 shadow-lg shadow-green-100 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Unggah Dokumen</h3>
            <p className="text-green-100 text-sm">Mulai pesanan cetak baru secara instan.</p>
          </div>
          <Link to="/upload" className="border-2 border-dashed border-green-300 rounded-2xl h-32 flex flex-col items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-all cursor-pointer relative z-10 mt-6">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-semibold">Buat Pesanan</span>
          </Link>
          <svg className="absolute -right-8 -bottom-8 w-40 h-40 text-green-400/30 group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        </div>

        {/* Price Info (4x3 Med Card) */}
        <div className="col-span-1 md:col-span-4 md:row-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Daftar Harga</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium">Hitam Putih (A4)</span>
              <span className="font-bold">Rp 500<small className="text-slate-500 font-normal">/hal</small></span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium">Berwarna (A4)</span>
              <span className="font-bold text-blue-600">Rp 1.500<small className="font-normal text-blue-400">/hal</small></span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium">Jilid Softcover</span>
              <span className="font-bold">Rp 15.000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium">Jilid Hardcover</span>
              <span className="font-bold">Rp 25.000</span>
            </div>
          </div>
        </div>

        {/* History List (8x3 Wide Card) */}
        <div className="col-span-1 md:col-span-8 md:row-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-lg font-bold">Pesanan Terakhir</h3>
            <Link to="/orders" className="text-blue-600 text-sm font-bold hover:underline">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                  <th className="pb-3 px-2 font-medium">Dokumen</th>
                  <th className="pb-3 px-2 font-medium text-right">Total</th>
                  <th className="pb-3 px-2 font-medium">Status</th>
                  <th className="pb-3 px-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.slice(0, 3).map(order => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2 font-semibold">
                      <div className="truncate max-w-[140px] sm:max-w-[200px]">{order.document_url}</div>
                    </td>
                    <td className="py-4 px-2 font-bold text-right whitespace-nowrap">Rp {Number(order.total_price || 0).toLocaleString()}</td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold tracking-wider",
                        order.status === 'Completed' ? "bg-green-100 text-green-700" :
                        order.status === 'Cancelled' ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right text-blue-600 font-bold whitespace-nowrap">
                      <Link to="/orders" className="hover:underline">Detail</Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">Belum ada pesanan terakhir.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
