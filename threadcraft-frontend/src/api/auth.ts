import { apiClient } from "./client";


export const authApi = {
    login: async (email: string, password: string)=> {
        const response = await apiClient.post('/auth/login', {email, password});
        return response.data.data;
    },

    verify2FA: async (userId: string, code: string) => {
        const response = await apiClient.post('/auth/2fa/verify', {userId, code});
        return response.data.data;
    },

    register: async ( data: { email: string, password: string, firstName: string, lastName: string }) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data.data;
    },

    logout: async () => {
        await apiClient.post('/auth/logout');
    },

    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data.data;
        },
};