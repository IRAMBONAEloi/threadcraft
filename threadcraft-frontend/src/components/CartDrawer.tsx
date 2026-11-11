import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeItem, itemCount } = useCart();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-white/10 z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-sora font-bold text-xl text-white">
            Your Cart <span className="text-violet">({itemCount})</span>
          </h2>
          <button onClick={onClose} className="text-text-dim hover:text-white text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center text-text-dim py-20">
              <p className="font-mono text-sm">Your cart is empty.</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-bg/50 p-4 rounded-xl border border-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center text-white/20">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H5v10a1 1 0 001 1h12a1 1 0 001-1V10h1.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-sora font-semibold text-white text-sm">{item.variant.design.name}</h3>
                  <p className="font-mono text-xs text-text-dim mt-1">{item.variant.size} / {item.variant.color}</p>
                  <p className="font-mono text-sm text-mint mt-2">{Number(item.unitPrice).toLocaleString()} RWF</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="text-coral text-xs font-mono hover:underline">Remove</button>
                  <div className="flex items-center gap-2 bg-bg rounded-lg p-1 border border-white/10">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center text-text-dim hover:text-white">-</button>
                    <span className="font-mono text-xs text-white w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-text-dim hover:text-white">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-bg/30">
            <div className="flex justify-between mb-4">
              <span className="text-text-dim">Subtotal</span>
              <span className="font-mono text-white">{Number(cart.subtotal).toLocaleString()} RWF</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="block w-full text-center bg-violet hover:bg-violet/90 text-white font-bold py-4 rounded-xl transition-colors">
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}