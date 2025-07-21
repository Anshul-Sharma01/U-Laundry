import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance.js";
import { toastHandler } from "../../Helpers/toastHandler.js";
import toast from "react-hot-toast";

const initialState = {
    allOrders: [],
    totalOrders: 0,
    totalPages: 1,
    loading: false,
};

export const fetchAllOrdersThunk = createAsyncThunk(
    "admin/all-orders",
    async ({ page = 1, limit = 10, status = '', searchTerm = '' }, { rejectWithValue }) => {
        try {
            const url = `order/getall?page=${page}&limit=${limit}&status=${status}&query=${searchTerm}`;
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch orders");
        }
    }
);

export const updateOrderStatusThunk = createAsyncThunk(
    "orders/update-order-status",
    async ({ orderId, status }, { dispatch, rejectWithValue }) => {
        try {
            const response = axiosInstance.patch(`order/update/${orderId}/${status}`);
            toastHandler(response, "Updating order status...", "Successfully updated order status!", "Failed to update order status!");
            
            const awaitedResponse = await response;
            dispatch(fetchAllOrdersThunk({})); // Refetch all orders with default params
            return awaitedResponse.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to update order status");
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllOrdersThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllOrdersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.allOrders = action.payload.data.orders;
                state.totalOrders = action.payload.data.totalOrders;
                state.totalPages = action.payload.data.totalPages;
            })
            .addCase(fetchAllOrdersThunk.rejected, (state, action) => {
                state.loading = false;
                toastHandler(null, null, null, action.payload);
            })
            .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
                const updatedOrder = action.payload.data;
                const index = state.allOrders.findIndex(order => order._id === updatedOrder._id);
                if (index !== -1) {
                    state.allOrders[index] = updatedOrder;
                }
            })
            .addCase(updateOrderStatusThunk.rejected, (state, action) => {
                toastHandler(null, null, null, action.payload);
            });
    },
});

export default adminSlice.reducer;

