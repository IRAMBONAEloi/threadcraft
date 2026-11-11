import { apiClient } from './client';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  getAllOrders: async () => {
    const response = await apiClient.get('/admin/orders');
    return response.data.data.orders;
  },

  updateOrderStatus: async (orderId: string, data: { status: string; paymentStatus: string; note?: string }) => {
    const response = await apiClient.patch(`/admin/orders/${orderId}/status`, data);
    return response.data.data;
  },
};