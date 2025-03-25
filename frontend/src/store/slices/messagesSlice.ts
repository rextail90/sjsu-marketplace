import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../types';
import { messages } from '../../services/api';

interface MessagesState {
    items: Message[];
    conversations: { [key: number]: Message[] };
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: MessagesState = {
    items: [],
    conversations: {},
    unreadCount: 0,
    loading: false,
    error: null,
};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        fetchMessagesStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchMessagesSuccess: (state, action: PayloadAction<{ content: Message[]; totalElements: number }>) => {
            state.loading = false;
            state.items = action.payload.content;
        },
        fetchMessagesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchConversationStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchConversationSuccess: (state, action: PayloadAction<{ userId: number; messages: Message[] }>) => {
            state.loading = false;
            state.conversations[action.payload.userId] = action.payload.messages;
        },
        fetchConversationFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        sendMessageStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        sendMessageSuccess: (state, action: PayloadAction<Message>) => {
            state.loading = false;
            state.items.unshift(action.payload);
            const conversationId = action.payload.sender.id;
            if (state.conversations[conversationId]) {
                state.conversations[conversationId].push(action.payload);
            }
        },
        sendMessageFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        markMessageAsReadStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        markMessageAsReadSuccess: (state, action: PayloadAction<number>) => {
            state.loading = false;
            const message = state.items.find(m => m.id === action.payload);
            if (message) {
                message.read = true;
            }
            state.unreadCount = Math.max(0, state.unreadCount - 1);
        },
        markMessageAsReadFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
    },
});

export const {
    fetchMessagesStart,
    fetchMessagesSuccess,
    fetchMessagesFailure,
    fetchConversationStart,
    fetchConversationSuccess,
    fetchConversationFailure,
    sendMessageStart,
    sendMessageSuccess,
    sendMessageFailure,
    markMessageAsReadStart,
    markMessageAsReadSuccess,
    markMessageAsReadFailure,
    setUnreadCount,
} = messagesSlice.actions;

export default messagesSlice.reducer; 