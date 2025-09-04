// src/lib/api.ts
import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      toast.error('Session expired. Please log in again.');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (response?.status === 403) {
      toast.error('Access denied');
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (response?.data?.message) {
      toast.error(response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Auth API
export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    walletAddress: string;
    referralCode?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: any; token: string }> => {
    const response: AxiosResponse<ApiResponse<{ user: any; token: string }>> = 
      await api.post('/auth/register', data);
    return response.data.data!;
  },

  login: async (email: string, password: string): Promise<{ user: any; token: string }> => {
    const response: AxiosResponse<ApiResponse<{ user: any; token: string }>> = 
      await api.post('/auth/login', { email, password });
    return response.data.data!;
  },

  me: async (): Promise<{ user: any }> => {
    const response: AxiosResponse<ApiResponse<{ user: any }>> = 
      await api.get('/auth/me');
    return response.data.data!;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response: AxiosResponse<ApiResponse<{ token: string }>> = 
      await api.post('/auth/refresh');
    return response.data.data!;
  },
};

// Rooms API
export const roomsApi = {
  getRooms: async (): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = 
      await api.get('/rooms');
    return response.data.data!;
  },

  getRoom: async (roomId: string): Promise<Room & { participants: RoomParticipant[] }> => {
    const response: AxiosResponse<ApiResponse<Room & { participants: RoomParticipant[] }>> = 
      await api.get(`/rooms/${roomId}`);
    return response.data.data!;
  },

  createRoom: async (data: {
    name: string;
    description?: string;
    topic?: string;
    isPrivate?: boolean;
    password?: string;
  }): Promise<Room> => {
    const response: AxiosResponse<ApiResponse<Room>> = 
      await api.post('/rooms', data);
    return response.data.data!;
  },

  joinRoom: async (roomId: string, password?: string): Promise<void> => {
    await api.post(`/rooms/${roomId}/join`, { password });
  },

  leaveRoom: async (roomId: string): Promise<void> => {
    await api.post(`/rooms/${roomId}/leave`);
  },

  getUserRooms: async (): Promise<Room[]> => {
    const response: AxiosResponse<ApiResponse<Room[]>> = 
      await api.get('/rooms/my-rooms');
    return response.data.data!;
  },
};

// Payments API
export const paymentsApi = {
  getWalletInfo: async (): Promise<PaymentInfo> => {
    const response: AxiosResponse<ApiResponse<PaymentInfo>> = 
      await api.get('/payments/wallet-info');
    return response.data.data!;
  },

  verifyPayment: async (transactionHash: string): Promise<void> => {
    await api.post('/payments/verify', { transactionHash });
  },

  getPaymentHistory: async (): Promise<MembershipTransaction[]> => {
    const response: AxiosResponse<ApiResponse<MembershipTransaction[]>> = 
      await api.get('/payments/history');
    return response.data.data!;
  },
};

// MLM API
export const mlmApi = {
  getStats: async (): Promise<MlmStats> => {
    const response: AxiosResponse<ApiResponse<MlmStats>> = 
      await api.get('/mlm/stats');
    return response.data.data!;
  },

  getReferralLink: async (): Promise<{ referralCode: string; referralLink: string }> => {
    const response: AxiosResponse<ApiResponse<{ referralCode: string; referralLink: string }>> = 
      await api.get('/mlm/referral-link');
    return response.data.data!;
  },

  getCommissions: async (): Promise<MlmCommission[]> => {
    const response: AxiosResponse<ApiResponse<MlmCommission[]>> = 
      await api.get('/mlm/commissions');
    return response.data.data!;
  },
};

// Users API
export const usersApi = {
  getProfile: async (): Promise<{ user: User }> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await api.get('/users/profile');
    return response.data.data!;
  },
};
