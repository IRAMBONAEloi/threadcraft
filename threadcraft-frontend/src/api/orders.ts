import { apiClient } from './client';

export const ordersApi = {
  checkout: async (data: {
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: string;
    guestEmail?: string;
    guestPhone?: string;
  }) => {
    const response = await apiClient.post('/orders/checkout', data);
    return response.data.data.order;
  },

  getMyOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data.data.orders;
  },

  getOrderById: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.data.order;
  },
};
