import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { useAuth } from '../context/AuthContext';




export default function Navbar() {


const { itemCount } = useCart();
const [isCartOpen, setIsCartOpen] = useState(false);
const {isAuthenticated, user, logout} = useAuth();


  return (
    <nav className="sticky top-0 z-50 w-full  bg-bg/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet to-coral shadow-[0_0_10px_rgba(139,107,255,0.5)]" />
          <span className="font-sora font-extrabold text-lg tracking-wide text-white">
            THREADCRAFT
          </span>
        </Link>

        {/* Links (Hidden on mobile for now) */}
        <div className="hidden md:flex items-center gap-8 text-sm text-text-dim">
          <Link to="/" className="hover:text-white transition-colors">Shop</Link>
          <Link to="/" className="hover:text-white transition-colors">Drops</Link>
          <Link to="/" className="hover:text-white transition-colors">About</Link>
        </div>

        {/* Actions */}
    <div className="flex items-center gap-6">
    {isAuthenticated ? (
  
  <>
    <Link 
      to={user?.role === 'OWNER' ? '/admin' : '/account'} 
      className="text-sm font-mono text-violet hover:text-white transition-colors"
    >
      {user?.role === 'OWNER' ? 'Dashboard' : 'My Account'}
    </Link>
    <button 
      onClick={async () => {
        await logout();
        window.location.href = '/login';
      }}
      className="text-sm font-mono text-coral hover:text-white transition-colors"
    >
      Sign Out
    </button>
  </>
) : (
  <Link 
    to="/login" 
    className="text-sm font-mono text-text-dim hover:text-white transition-colors"
  >
    Sign In
  </Link>
  
)}
          <button 
          onClick={() =>  setIsCartOpen(true)}
          className="bg-white text-bg px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
            Cart ({itemCount})
          </button>
        </div>
      </div>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}