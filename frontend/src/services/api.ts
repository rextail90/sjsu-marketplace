import axios, { AxiosError } from 'axios';
import { AuthResponse, Listing, Message, User, ApiError } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle API errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject({
            message: error.response?.data || 'An error occurred',
            status: error.response?.status || 500,
        } as ApiError);
    }
);

// Auth endpoints
export const auth = {
    register: async (userData: Partial<User>): Promise<void> => {
        await api.post('/auth/register', userData);
    },
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', { username, password });
        localStorage.setItem('token', response.data.token);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
};

// Listing endpoints
export const listings = {
    create: async (listingData: FormData): Promise<Listing> => {
        const response = await api.post<Listing>('/listings', listingData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getAll: async (params: { page?: number; size?: number; search?: string } = {}): Promise<{ content: Listing[]; totalElements: number }> => {
        const { page = 0, size = 10, search } = params;
        const response = await api.get(`/listings?page=${page}&size=${size}${search ? `&search=${search}` : ''}`);
        return response.data;
    },
    getById: async (id: number): Promise<Listing> => {
        const response = await api.get<Listing>(`/listings/${id}`);
        return response.data;
    },
    search: async (keyword: string, page = 0, size = 10): Promise<{ content: Listing[]; totalElements: number }> => {
        const response = await api.get(`/listings/search?keyword=${keyword}&page=${page}&size=${size}`);
        return response.data;
    },
    getByCategory: async (category: string, page = 0, size = 10): Promise<{ content: Listing[]; totalElements: number }> => {
        const response = await api.get(`/listings/category/${category}?page=${page}&size=${size}`);
        return response.data;
    },
    getUserListings: async (page = 0, size = 10): Promise<{ content: Listing[]; totalElements: number }> => {
        const response = await api.get(`/listings/user?page=${page}&size=${size}`);
        return response.data;
    },
    updateStatus: async (id: number, status: string): Promise<Listing> => {
        const response = await api.put<Listing>(`/listings/${id}/status?status=${status}`);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/listings/${id}`);
    },
};

// Message endpoints
export const messages = {
    send: async (messageData: { receiverId: number; content: string; listingId?: number }): Promise<Message> => {
        const response = await api.post<Message>('/messages', messageData);
        return response.data;
    },
    getAll: async (page = 0, size = 20): Promise<{ content: Message[]; totalElements: number }> => {
        const response = await api.get(`/messages?page=${page}&size=${size}`);
        return response.data;
    },
    getConversation: async (userId: number): Promise<Message[]> => {
        const response = await api.get<Message[]>(`/messages/conversation/${userId}`);
        return response.data;
    },
    markAsRead: async (messageId: number): Promise<void> => {
        await api.put(`/messages/${messageId}/read`);
    },
    getUnreadCount: async (): Promise<number> => {
        const response = await api.get<number>('/messages/unread/count');
        return response.data;
    },
};

export default api; 