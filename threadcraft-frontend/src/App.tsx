import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Navbar from './components/Navbar';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AuthCallback from './pages/AuthCallback';
import AdminGuard from './components/AdminGuard';
import Dashboard from './pages/admin/Dashboard';




function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
      
      
      
    </Routes>
    </main>
    </div>
  );
}

export default App;