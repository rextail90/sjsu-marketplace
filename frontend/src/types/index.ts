export enum ListingStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    SOLD = 'SOLD',
    CANCELLED = 'CANCELLED'
}

export interface User {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
}

export interface ListingImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    listingId: number;
}

export interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    status: ListingStatus;
    seller: User;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: number;
    content: string;
    sender: User;
    receiver: User;
    listing?: Listing;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    username: string;
}

export interface ApiError {
    message: string;
    status: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export interface RootState {
    auth: AuthState;
} 