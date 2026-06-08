import { Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Files, Home, FileText, CheckSquare, LogOut, Bell, BarChart3, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { apiUrl } from '../lib/api';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || isAdmin) return;

    fetch(apiUrl('/api/notifications'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        const notifications = data.notifications || [];
        setUnreadCount(notifications.filter((item: { is_read: number | boolean }) => !item.is_read).length);
      })
      .catch(() => setUnreadCount(0));
  }, [isAdmin, location.pathname, user]);

  const customerLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Order Print', href: '/upload', icon: Files },
    { name: 'My Orders', href: '/orders', icon: FileText },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Operations', href: '/admin/orders', icon: CheckSquare },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <div className="flex h-screen w-64 flex-col bg-indigo-900 text-white">
      <div className="flex shrink-0 items-center p-6 gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Files className="h-5 w-5 text-white" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">Foto Copy v1</h1>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-2 pb-4">
        <nav className="flex-1 px-4 space-y-1" aria-label="Sidebar">
          {links.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-indigo-800 text-white'
                    : 'text-white/60 hover:bg-indigo-800/50 hover:text-white',
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-colors gap-3'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-blue-300' : 'opacity-60 group-hover:opacity-100',
                    'shrink-0 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.name}</span>
                {item.href === '/notifications' && unreadCount > 0 && (
                  <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 mt-auto border-t border-indigo-800 flex flex-col gap-4">
        <Link
          to="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 opacity-70" />
          Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-white">{user?.name}</span>
            <span className="text-xs text-indigo-300 capitalize">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-800/50 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800 transition-colors"
        >
          <LogOut className="h-4 w-4 opacity-60" />
          Logout
        </button>
      </div>
    </div>
  );
}
