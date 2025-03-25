import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Listing } from '../../types';
import { listings } from '../../services/api';

interface ListingsState {
    items: Listing[];
    currentListing: Listing | null;
    userListings: Listing[];
    totalElements: number;
    loading: boolean;
    error: string | null;
}

const initialState: ListingsState = {
    items: [],
    currentListing: null,
    userListings: [],
    totalElements: 0,
    loading: false,
    error: null,
};

const listingsSlice = createSlice({
    name: 'listings',
    initialState,
    reducers: {
        fetchListingsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchListingsSuccess: (state, action: PayloadAction<{ content: Listing[]; totalElements: number }>) => {
            state.loading = false;
            state.items = action.payload.content;
            state.totalElements = action.payload.totalElements;
        },
        fetchListingsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setCurrentListing: (state, action: PayloadAction<Listing>) => {
            state.currentListing = action.payload;
        },
        clearCurrentListing: (state) => {
            state.currentListing = null;
        },
        fetchUserListingsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchUserListingsSuccess: (state, action: PayloadAction<{ content: Listing[]; totalElements: number }>) => {
            state.loading = false;
            state.userListings = action.payload.content;
        },
        fetchUserListingsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        createListingStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        createListingSuccess: (state, action: PayloadAction<Listing>) => {
            state.loading = false;
            state.items.unshift(action.payload);
            state.userListings.unshift(action.payload);
        },
        createListingFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateListingStatusStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateListingStatusSuccess: (state, action: PayloadAction<Listing>) => {
            state.loading = false;
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.currentListing?.id === action.payload.id) {
                state.currentListing = action.payload;
            }
        },
        updateListingStatusFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteListingStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteListingSuccess: (state, action: PayloadAction<number>) => {
            state.loading = false;
            state.items = state.items.filter(item => item.id !== action.payload);
            state.userListings = state.userListings.filter(item => item.id !== action.payload);
            if (state.currentListing?.id === action.payload) {
                state.currentListing = null;
            }
        },
        deleteListingFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchListingsStart,
    fetchListingsSuccess,
    fetchListingsFailure,
    setCurrentListing,
    clearCurrentListing,
    fetchUserListingsStart,
    fetchUserListingsSuccess,
    fetchUserListingsFailure,
    createListingStart,
    createListingSuccess,
    createListingFailure,
    updateListingStatusStart,
    updateListingStatusSuccess,
    updateListingStatusFailure,
    deleteListingStart,
    deleteListingSuccess,
    deleteListingFailure,
} = listingsSlice.actions;

export default listingsSlice.reducer; 