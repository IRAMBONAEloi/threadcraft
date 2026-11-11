import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { cartApi } from '../api/cart';

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: string;
  variant: {
    id: string;
    size: string;
    color: string;
    design: { name: string; images: string[] };
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshCart() {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }

  useEffect(() => {
    async function init() {
      await refreshCart();
      setIsLoading(false);
    }
    init();
  }, []);

  async function addToCart(variantId: string, quantity: number = 1) {
    const updatedCart = await cartApi.addItem(variantId, quantity);
    setCart(updatedCart);
  }

  async function updateQuantity(itemId: string, quantity: number) {
    const updatedCart = await cartApi.updateQuantity(itemId, quantity);
    setCart(updatedCart);
  }

  async function removeItem(itemId: string) {
    const updatedCart = await cartApi.removeItem(itemId);
    setCart(updatedCart);
  }

  const itemCount = cart?.items.length || 0;

  return (
    <CartContext.Provider value={{
      cart,
      itemCount,
      isLoading,
      addToCart,
      updateQuantity,
      removeItem,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}