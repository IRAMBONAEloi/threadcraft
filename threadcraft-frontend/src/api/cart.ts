import { apiClient } from './client';

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data.data.cart;
  },
  addItem: async (variantId: string, quantity: number = 1) => {
    const response = await apiClient.post('/cart/items', { variantId, quantity });
    return response.data.data.cart;
  },
  updateQuantity: async (itemId: string, quantity: number) => {
    const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return response.data.data.cart;
  },
  removeItem: async (itemId: string) => {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data.data.cart;
  },
};