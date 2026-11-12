import { Routes, Route, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AuthCallback from './pages/AuthCallback';
import AdminGuard from './components/AdminGuard';
import Dashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminSettings from './pages/admin/Settings';
import { useAuth } from './context/AuthContext';
import VerifyEmail from './pages/VerifyEmail';


function App() {
  const { user } = useAuth();
  const location = useLocation();


  const hideNavbar = location.pathname === '/order-success' || location.pathname === '/auth/callback';


  const isAdmin = user?.role === 'OWNER';
  const showAdminNavbar = isAdmin && location.pathname.startsWith('/admin');


  
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && (
        showAdminNavbar ? <AdminNavbar /> : <Navbar />
      )}
      
      <main className="flex-1">
    <Routes>
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<Checkout/>} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin" element={<AdminGuard><Dashboard /></AdminGuard>} />
      <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>}/>
      <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      
    </Routes>
    </main>
    </div>
  );
}

export default App;