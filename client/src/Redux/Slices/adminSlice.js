import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance.js";
import { toastHandler } from "../../Helpers/toastHandler.js";

const initialState = {
    allOrders : [],
    page : 1,
    limit : 10
}

export const fetchAllOrdersThunk = createAsyncThunk("admin/fetch-all-orders", async({ page, limit }) => {
    try{
        const response = axiosInstance.get(`order/getall?page=${page}&limit=${limit}`);
        toastHandler(response, "Fetching all orders...", "Successfully fetched all orders", "Failed to fetch all orders");
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while fetching all orders`);
    }
})

export const updateOrderStatusThunk = createAsyncThunk("orders/update-order-status", async({ orderId, status }, { dispatch, getState }) => {
    try{
        const response = axiosInstance.patch(`order/update/${orderId}/${status}`);
        toastHandler(response, "Updating order status...", "Successfully updated order status !!", "Failed to update order status !!");
        const { page, limit } = getState().admin;
        dispatch(fetchAllOrdersThunk({ page : page || 1, limit : limit || 10 })); 
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while updating order status thunk : ${err}`);
    }
}) 


const adminSlice = createSlice({
    name : "admin",
    initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder
            .addCase(fetchAllOrdersThunk.fulfilled, (state, action) => {
                state.allOrders = action.payload.data;
                state.page = action.meta.arg.page;
                state.limit = action.meta.arg.limit;
            })
    }
})

export default adminSlice.reducer;

