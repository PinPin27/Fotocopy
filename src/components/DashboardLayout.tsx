import { Outlet, Navigate } from 'react-router';
import Sidebar from './Sidebar';
import { User } from '../types';

export default function DashboardLayout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden font-sans text-slate-900">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
