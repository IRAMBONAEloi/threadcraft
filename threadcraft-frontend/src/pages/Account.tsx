import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api/orders';
import { Navigate, Link } from 'react-router-dom';

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchOrders() {
      try {
        const data = await ordersApi.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-sora font-bold text-3xl text-white">My Account</h1>
            <p className="text-text-dim mt-1">Welcome, {user?.firstName}</p>
          </div>
          <button onClick={logout} className="text-sm font-mono text-coral hover:underline">
            Sign Out
          </button>
        </div>

        {/* Order History */}
        <h2 className="font-sora font-bold text-xl text-white mb-6">Order History</h2>
        
        {loading ? (
          <p className="text-text-dim font-mono">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-card p-8 rounded-2xl border border-white/5 text-center">
            <p className="text-text-dim mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="bg-violet text-white px-6 py-2 rounded-lg font-mono text-sm inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-text-dim mb-1">{order.orderNumber}</p>
                  <h3 className="font-sora font-bold text-white">{order.items.length} item(s)</h3>
                  <p className="text-xs text-text-faint mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-mint font-bold mb-1">
                    {Number(order.total).toLocaleString()} RWF
                  </p>
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border ${
                    order.status === 'DELIVERED' ? 'border-mint/30 text-mint bg-mint/10' :
                    order.status === 'SHIPPED' ? 'border-violet/30 text-violet bg-violet/10' :
                    order.status === 'CANCELLED' ? 'border-coral/30 text-coral bg-coral/10' :
                    'border-white/20 text-text-dim bg-white/5'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}