import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api/orders';

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode] = useState('00000');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOMO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-dim">
        <p>Your cart is empty. <a href="/" className="text-violet hover:underline">Go shopping</a></p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const order = await ordersApi.checkout({
        shippingAddress: { street, city, state, postalCode, country: 'RW' },
        paymentMethod,
        guestEmail: user ? undefined : guestEmail,
        guestPhone: user ? undefined : guestPhone,
      });
      
      // Refresh cart to show it's empty
      await refreshCart();
      
      // Redirect to a success page (we'll build it next)
      navigate('/order-success', { state: { order } });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  }
return (
  <div className="min-h-[calc(100vh-100px)] bg-bg px-6 py-10 flex items-center">
    <div className="max-w-4xl mx-auto w-full">

      <h1 className="font-sora font-bold text-4xl mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Left: form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <>
              <input type="email" placeholder="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required className="w-full bg-card border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet" />
              <input type="tel" placeholder="Phone (e.g. +250788000000)" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required className="w-full bg-card border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet" />
            </>
          )}

          <input type="text" placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} required className="w-full bg-card border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full bg-card border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet" />
            <input type="text" placeholder="State/Province" value={state} onChange={(e) => setState(e.target.value)} required className="w-full bg-card border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet" />
          </div>

          <div className="pt-4">
            <label className="block text-sm text-text-dim mb-2">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-card border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet">
              <option value="MOMO">MTN Mobile Money</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash on Delivery</option>
            </select>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-violet hover:bg-violet/90 disabled:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors mt-6">
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Right: order summary */}
        <div className="bg-card p-5 rounded-2xl border border-white/5 h-fit">
          <h2 className="font-sora font-bold text-xl mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-text-dim">{item.quantity}x {item.variant.design.name} ({item.variant.size})</span>
                <span className="font-mono text-white">{(Number(item.unitPrice) * item.quantity).toLocaleString()} RWF</span>
              </div>
            ))}
          </div>
                   <div className="space-y-3 border-t border-white/10 pt-4 mb-4">
            <div className="flex justify-between text-sm text-text-dim">
              <span>Subtotal</span>
              <span className="font-mono">{Number(cart.subtotal).toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-sm text-text-dim">
              <span>Shipping (Rwanda)</span>
              <span className="font-mono">2,000 RWF</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span className="text-white">Total</span>
            <span className="font-mono text-mint">
              {(Number(cart.subtotal) + 2000).toLocaleString()} RWF
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
);
}