import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-dim font-mono">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-bg pt-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="font-sora font-bold text-3xl text-white">Owner Dashboard</h1>
            <p className="text-text-dim mt-1">Manage your store</p>
          </div>
          <Link to="/admin/orders" className="bg-white text-bg px-6 py-2 rounded-full font-mono text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
            View Orders
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-2xl border border-white/5">
            <p className="text-text-dim text-sm mb-2">Total Revenue</p>
            <p className="font-mono text-3xl text-mint font-bold">
              {Number(stats.totalRevenue).toLocaleString()} RWF
            </p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-white/5">
            <p className="text-text-dim text-sm mb-2">Total Orders</p>
            <p className="font-mono text-3xl text-white font-bold">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-white/5">
            <p className="text-text-dim text-sm mb-2">Low Stock Alerts</p>
            <p className="font-mono text-3xl text-coral font-bold">
              {stats.lowStockVariants}
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <h2 className="font-sora font-bold text-xl text-white mb-6">Recent Orders</h2>
        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-bg/50 text-text-dim text-xs font-mono uppercase tracking-widest">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="border-t border-white/5 text-sm">
                  <td className="p-4 font-mono text-white">{order.orderNumber}</td>
                  <td className="p-4 text-text-dim">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.guestEmail}
                  </td>
                  <td className="p-4 font-mono text-mint">
                    {Number(order.total).toLocaleString()} RWF
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border ${
                      order.status === 'PAID' ? 'border-mint/30 text-mint bg-mint/10' :
                      order.status === 'DELIVERED' ? 'border-mint/30 text-mint bg-mint/10' :
                      order.status === 'PENDING' ? 'border-coral/30 text-coral bg-coral/10' :
                      'border-white/20 text-text-dim bg-white/5'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}