import { useEffect, useState } from 'react';
import { BarChart3, Users, FileText } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, activeOrders: 0, completedOrders: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/admin/stats'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat statistik dashboard.');
        return res.json();
      })
      .then(data => {
        setStats({
          totalRevenue: Number(data.totalRevenue || 0),
          activeOrders: Number(data.activeOrders || 0),
          completedOrders: Number(data.completedOrders || 0),
        });
        setError('');
      })
      .catch(() => {
        setStats({ totalRevenue: 0, activeOrders: 0, completedOrders: 0 });
        setError('Statistik belum bisa dimuat. Cek koneksi database/server.');
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="font-medium text-slate-600">Total Revenue</h2>
          </div>
          <p className="text-3xl font-bold text-slate-900">Rp {stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="font-medium text-slate-600">Active Orders</h2>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.activeOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="font-medium text-slate-600">Completed</h2>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.completedOrders}</p>
        </div>
      </div>
    </div>
  );
}
