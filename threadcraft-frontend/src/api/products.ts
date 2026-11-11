import { apiClient } from './client';

export const productsApi = {
  getAll: async (filters?: { category?: string; search?: string; sort?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort) params.append('sort', filters.sort);
    
    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data.data.designs;
  },

  getOne: async (slug: string) => {
    const response = await apiClient.get(`/products/${slug}`);
    return response.data.data.design;
  },

  getCategories: async () => {
    const response = await apiClient.get('/products/categories');
    return response.data.data.categories;
  },
};