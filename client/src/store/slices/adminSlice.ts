import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helpers/axiosInstance';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserAvatar {
    public_id: string;
    secure_url: string;
}

interface AdminUser {
    _id: string;
    username: string;
    name: string;
    email: string;
    fatherName?: string;
    studentId?: number;
    hostelName?: string;
    roomNumber?: string;
    degreeName?: string;
    avatar: UserAvatar;
    role?: string;
    isVerified?: boolean;
    verificationStatus?: string;
    createdAt?: string;
    updatedAt?: string;
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

interface AdminOrder {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        avatar?: UserAvatar;
        hostelName?: string;
        username?: string;
        roomNumber?: string;
        studentId?: number;
    };
    items: OrderItem[];
    totalClothes: number;
    moneyAmount: number;
    status: string;
    moneyPaid: boolean;
    createdAt: string;
    updatedAt: string;
    pickupSlot?: {
        slotDate: string;
        slotLabel: string;
        selectedAt?: string;
    };
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

interface DashboardStats {
    users: {
        total: number;
        verified: number;
        pending: number;
        rejected: number;
    };
    orders: {
        total: number;
        revenue: number;
        byStatus: StatusCount[];
        trend: TrendDay[];
    };
    recentOrders: AdminOrder[];
}

interface AdminState {
    stats: DashboardStats | null;
    pendingUsers: AdminUser[];
    allUsers: AdminUser[];
    orders: AdminOrder[];
    ordersTotalPages: number;
    ordersTotalCount: number;
    ordersCurrentPage: number;
    isLoading: boolean;
    statsLoading: boolean;
    error: string;
}

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchDashboardStats = createAsyncThunk(
    'admin/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('users/admin/stats');
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const fetchPendingUsers = createAsyncThunk(
    'admin/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('users/pending');
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending users');
        }
    }
);

export const approveUser = createAsyncThunk(
    'admin/approveUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.patch(`users/verify/${userId}`);
            return { ...data, userId };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to approve user');
        }
    }
);

export const rejectUser = createAsyncThunk(
    'admin/rejectUser',
    async ({ userId, note }: { userId: string; note: string }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.patch(`users/reject/${userId}`, { note });
            return { ...data, userId };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to reject user');
        }
    }
);

export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('users/getall');
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.delete(`users/delete/${userId}`);
            return { ...data, userId };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
        }
    }
);

export const fetchAllOrders = createAsyncThunk(
    'admin/fetchAllOrders',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(`orders/getall?page=${page}&limit=${limit}`);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const fetchOrdersByStatus = createAsyncThunk(
    'admin/fetchOrdersByStatus',
    async (status: string, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get(`orders/get/${encodeURIComponent(status)}`);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'admin/updateOrderStatus',
    async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.patch(`orders/update/${orderId}/${encodeURIComponent(status)}`);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState: AdminState = {
    stats: null,
    pendingUsers: [],
    allUsers: [],
    orders: [],
    ordersTotalPages: 0,
    ordersTotalCount: 0,
    ordersCurrentPage: 1,
    isLoading: false,
    statsLoading: false,
    error: '',
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => { state.error = ''; },
    },
    extraReducers: (builder) => {
        builder
            // ── Dashboard Stats ──
            .addCase(fetchDashboardStats.pending, (state) => { state.statsLoading = true; })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload.data;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload as string;
            })

            // ── Pending Users ──
            .addCase(fetchPendingUsers.pending, (state) => { state.isLoading = true; })
            .addCase(fetchPendingUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pendingUsers = action.payload.data;
            })
            .addCase(fetchPendingUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ── Approve User ──
            .addCase(approveUser.fulfilled, (state, action) => {
                state.pendingUsers = state.pendingUsers.filter(u => u._id !== action.payload.userId);
            })

            // ── Reject User ──
            .addCase(rejectUser.fulfilled, (state, action) => {
                state.pendingUsers = state.pendingUsers.filter(u => u._id !== action.payload.userId);
            })

            // ── All Users ──
            .addCase(fetchAllUsers.pending, (state) => { state.isLoading = true; })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allUsers = action.payload.data;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ── Delete User ──
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.allUsers = state.allUsers.filter(u => u._id !== action.payload.userId);
            })

            // ── All Orders ──
            .addCase(fetchAllOrders.pending, (state) => { state.isLoading = true; })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload.data.orders;
                state.ordersTotalPages = action.payload.data.totalPages;
                state.ordersTotalCount = action.payload.data.totalOrders;
                state.ordersCurrentPage = action.payload.data.currentPage;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ── Orders by Status ──
            .addCase(fetchOrdersByStatus.pending, (state) => { state.isLoading = true; })
            .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload.data;
            })
            .addCase(fetchOrdersByStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ── Update Order Status ──
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const updated = action.payload.data;
                const idx = state.orders.findIndex(o => o._id === updated._id);
                if (idx !== -1) state.orders[idx] = { ...state.orders[idx], status: updated.status };
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
