import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css'
import App from './App'
import { CartProvider } from './context/CartContext';
import { getOrcreateSessionId } from './utils/session';

createRoot(document.getElementById('root')!).render
(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>  
  </StrictMode>,
)
getOrcreateSessionId();