import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helpers/axiosInstance';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserAvatar {
    public_id: string;
    secure_url: string;
}

interface OrderItem {
    laundryItem: {
        _id: string;
        title: string;
        pricePerUnit: number;
        image?: UserAvatar;
        category?: string;
    };
    quantity: number;
}

interface ModeratorOrder {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        avatar?: UserAvatar;
        hostelName?: string;
        roomNumber?: string;
    };
    items: OrderItem[];
    totalClothes: number;
    moneyAmount: number;
    status: string;
    moneyPaid: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TrendDay {
    date: string;
    day: string;
    orders: number;
    revenue: number;
}

interface StatusCount {
    _id: string;
    count: number;
}

interface ModeratorStats {
    orders: {
        total: number;
        active: number;
        revenue: number;
        monthlyRevenue: number;
        byStatus: StatusCount[];
        trend: TrendDay[];
    };
    recentOrders: ModeratorOrder[];
}

interface ModeratorState {
    stats: ModeratorStats | null;
    statsLoading: boolean;
    error: string;
}

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchModeratorStats = createAsyncThunk(
    'moderator/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('users/moderator/stats');
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch moderator stats');
        }
    }
);

export const createLaundryItem = createAsyncThunk(
    'moderator/createLaundryItem',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('laundry-items', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create laundry item');
        }
    }
);

export const deleteLaundryItem = createAsyncThunk(
    'moderator/deleteLaundryItem',
    async (itemId: string, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.delete(`laundry-items/${itemId}`);
            return { ...data, itemId };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete laundry item');
        }
    }
);

export const fetchAllLaundryItems = createAsyncThunk(
    'moderator/fetchAllLaundryItems',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('laundry-items');
            return data.data; // Since ApiResponse wraps it in data
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch laundry items');
        }
    }
);

export const updateModeratorOrderStatus = createAsyncThunk(
    'moderator/updateOrderStatus',
    async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.patch(`order/update/${orderId}/${encodeURIComponent(status)}`);
            return data.data; // Server usually sends the updated order back inside data.data or just data
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

export interface CustomLaundryItem {
    _id: string;
    title: string;
    pricePerUnit: number;
    maxQuantityPerOrder: number;
    category?: string;
    description?: string;
    image?: UserAvatar;
}

interface ModeratorState {
    stats: ModeratorStats | null;
    statsLoading: boolean;
    items: CustomLaundryItem[];
    itemsLoading: boolean;
    error: string;
}

const initialState: ModeratorState = {
    stats: null,
    statsLoading: false,
    items: [],
    itemsLoading: false,
    error: '',
};

const moderatorSlice = createSlice({
    name: 'moderator',
    initialState,
    reducers: {
        clearModeratorError: (state) => { state.error = ''; },
    },
    extraReducers: (builder) => {
        builder
            // ── Dashboard Stats ──
            .addCase(fetchModeratorStats.pending, (state) => { state.statsLoading = true; })
            .addCase(fetchModeratorStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload.data;
            })
            .addCase(fetchModeratorStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload as string;
            })
            
            // ── Order Status Update ──
            .addCase(updateModeratorOrderStatus.fulfilled, (state, action) => {
                if (state.stats && state.stats.recentOrders) {
                    const updatedOrder = action.payload; // assumes action.payload is the updated order object
                    const targetIndex = state.stats.recentOrders.findIndex(o => o._id === updatedOrder._id);
                    if (targetIndex !== -1) {
                        state.stats.recentOrders[targetIndex].status = updatedOrder.status;
                    }
                }
            })
            
            // ── Laundry Items ──
            .addCase(fetchAllLaundryItems.pending, (state) => { state.itemsLoading = true; })
            .addCase(fetchAllLaundryItems.fulfilled, (state, action) => {
                state.itemsLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllLaundryItems.rejected, (state, action) => {
                state.itemsLoading = false;
                state.error = action.payload as string;
            })
            
            // ── Create Laundry Item ──
            .addCase(createLaundryItem.fulfilled, (state, action) => {
                if (action.payload.data) {
                    state.items.push(action.payload.data);
                }
            })
            
            // ── Delete Laundry Item ──
            .addCase(deleteLaundryItem.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item._id !== action.payload.itemId);
            });
    },
});

export const { clearModeratorError } = moderatorSlice.actions;
export default moderatorSlice.reducer;
