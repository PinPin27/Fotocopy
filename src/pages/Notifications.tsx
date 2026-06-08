import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Notification } from '../types';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    fetch(apiUrl('/api/notifications'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await fetch(apiUrl('/api/notifications/read-all'), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchNotifications();
  };

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">{unreadCount} notifikasi belum dibaca.</p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          Tandai Dibaca
        </button>
      </header>

      <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="divide-y divide-slate-100">
          {notifications.map(notification => (
            <div key={notification.id} className={cn('flex gap-4 p-5', !notification.is_read && 'bg-blue-50/50')}>
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                notification.is_read ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
              )}>
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                  <time className="text-xs text-slate-400">
                    {new Date(notification.created_at).toLocaleString('id-ID')}
                  </time>
                </div>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
              </div>
            </div>
          ))}
          {!loading && notifications.length === 0 && (
            <div className="p-10 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">Belum ada notifikasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
