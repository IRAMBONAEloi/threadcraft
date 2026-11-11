import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // If someone navigates here directly without an order, kick them to home
  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-bg pt-20 px-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-card p-8 rounded-2xl border border-white/10 text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-mint/20 text-mint rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>

        <h1 className="font-sora font-bold text-3xl text-white mb-2">Order Placed!</h1>
        <p className="text-text-dim mb-8">Thank you for shopping with ThreadCraft.</p>

        <div className="bg-bg rounded-xl p-6 mb-8 border border-white/5 text-left">
          <div className="flex justify-between mb-3">
            <span className="text-text-dim">Order Number</span>
            <span className="font-mono text-white">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-text-dim">Total to Pay</span>
            <span className="font-mono text-mint font-bold">
              {Number(order.total).toLocaleString()} RWF
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-dim">Payment Method</span>
            <span className="font-mono text-white">{order.paymentMethod || 'MoMo'}</span>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-violet/10 border border-violet/20 rounded-xl p-6 text-left mb-8">
          <h3 className="font-sora font-bold text-violet mb-2">Next Step: Send Payment</h3>
          <p className="text-sm text-text-dim mb-4">
            Please send <strong className="text-white">{Number(order.total).toLocaleString()} RWF</strong> to our MoMo number:
          </p>
          <div className="bg-bg p-3 rounded-lg text-center mb-4 border border-white/10">
            <span className="font-mono text-lg text-white tracking-widest">0788 XXX XXX</span>
          </div>
          <p className="text-xs text-text-faint">
            Use your Order Number <strong>{order.orderNumber}</strong> as the reference. We will verify the payment and ship your order immediately.
          </p>
        </div>

        <Link to="/" className="block w-full bg-white text-bg font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">
          Return to Shop
        </Link>
      </div>
    </div>
  );
}