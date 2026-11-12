import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchOrders() {
    try {
      const data = await adminApi.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleUpdateStatus(orderId: string, status: string, paymentStatus: string) {
    setUpdating(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, { status, paymentStatus });
      await fetchOrders(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-text-dim font-mono">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-bg pt-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <Link to="/admin" className="text-text-dim text-sm hover:text-white mb-2 block">← Back to Dashboard</Link>
            <h1 className="font-sora font-bold text-3xl text-white">Orders</h1>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg/50 text-text-dim text-xs font-mono uppercase tracking-widest">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-white/5">
                  <td className="p-4">
                    <p className="font-mono text-white">{order.orderNumber}</p>
                    <p className="text-xs text-text-faint">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 text-text-dim">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : (
                      <span className="text-xs">Guest: {order.guestEmail}</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-mint">{Number(order.total).toLocaleString()} RWF</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border ${
                      order.status === 'DELIVERED' ? 'border-mint/30 text-mint bg-mint/10' :
                      order.status === 'SHIPPED' ? 'border-violet/30 text-violet bg-violet/10' :
                      order.status === 'PAID' ? 'border-mint/30 text-mint bg-mint/10' :
                      order.status === 'CANCELLED' ? 'border-coral/30 text-coral bg-coral/10' :
                      'border-white/20 text-text-dim bg-white/5'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border ${
                      order.paymentStatus === 'PAID' ? 'border-mint/30 text-mint bg-mint/10' :
                      order.paymentStatus === 'REFUNDED' ? 'border-coral/30 text-coral bg-coral/10' :
                      'border-white/20 text-text-dim bg-white/5'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {order.paymentStatus === 'PENDING' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'PAID', 'PAID')}
                        disabled={updating === order.id}
                        className="bg-mint/10 hover:bg-mint/20 text-mint text-xs font-mono uppercase px-3 py-1 rounded border border-mint/20 transition-colors"
                      >
                        {updating === order.id ? '...' : 'Mark Paid'}
                      </button>
                    )}
                    {order.status === 'PAID' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED', 'PAID')}
                        disabled={updating === order.id}
                        className="bg-violet/10 hover:bg-violet/20 text-violet text-xs font-mono uppercase px-3 py-1 rounded border border-violet/20 transition-colors"
                      >
                        {updating === order.id ? '...' : 'Mark Shipped'}
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED', 'PAID')}
                        disabled={updating === order.id}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase px-3 py-1 rounded border border-white/20 transition-colors"
                      >
                        {updating === order.id ? '...' : 'Mark Delivered'}
                      </button>
                    )}
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