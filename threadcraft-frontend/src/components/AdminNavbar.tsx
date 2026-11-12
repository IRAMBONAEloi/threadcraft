import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo & Admin Badge */}
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet to-coral shadow-[0_0_10px_rgba(139,107,255,0.5)]" />
            <span className="font-sora font-extrabold text-lg tracking-wide text-white">
              THREADCRAFT
            </span>
          </Link>
          <span className="bg-violet/20 text-violet text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border border-violet/30">
            Admin
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-mono text-text-dim uppercase tracking-widest">
          <Link to="/admin" className="hover:text-white transition-colors">Dashboard</Link>
          <Link to="/admin/orders" className="hover:text-white transition-colors">Orders</Link>
          <Link to="/admin/stock" className="hover:text-white transition-colors">Stock</Link>
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full bg-violet/20 border border-violet/40 flex items-center justify-center text-violet font-bold hover:bg-violet/30 transition-colors"
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-white text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-text-dim text-xs font-mono">{user?.email}</p>
              </div>
              <Link 
                to="/admin/settings" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-sm text-text-dim hover:bg-white/5 hover:text-white transition-colors"
              >
                Settings & Security
              </Link>
              <button 
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-3 text-sm text-coral hover:bg-white/5 transition-colors border-t border-white/10"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}