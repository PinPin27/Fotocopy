import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import DashboardLayout from './components/DashboardLayout';
import CustomerDashboard from './pages/CustomerDashboard';
import OrderPrint from './pages/OrderPrint';
import CustomerOrders from './pages/CustomerOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import Notifications from './pages/Notifications';
import { User } from './types';

const readStoredUser = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) return null;

  try {
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.id || !parsedUser?.name || !parsedUser?.role) {
      throw new Error('Invalid stored user');
    }

    return parsedUser as User;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const handleLogin = (data: { token: string, user: User }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Landing user={user} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route element={<DashboardLayout user={user} onLogout={handleLogout} />}>
        {/* Customer Routes */}
        <Route path="/dashboard" element={<CustomerDashboard user={user} />} />
        <Route path="/upload" element={<OrderPrint />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/notifications" element={<Notifications />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/orders" element={user?.role === 'admin' ? <AdminOrders /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/queue" element={<Navigate to="/admin/orders" replace />} />
        <Route path="/admin/payments" element={<Navigate to="/admin/orders" replace />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
