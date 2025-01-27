import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance.js";
import { toastHandler } from "../../Helpers/toastHandler.js";


const initialState = {
    order : null,
    userOrders : [],
}


export const createOrderThunk = createAsyncThunk("orders/create-order", async(data) => {
    try{
        const response = axiosInstance.post("order/add", data);
        toastHandler(response, "Creating new order...", "Successfully created a new order", "Failed to create a new order");
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while creating a new order : ${err}`);
    }
})


export const verifyPaymentThunk = createAsyncThunk("order/verifyPayment", async(data) => {
    try{
        const response = axiosInstance.post("order/verify-signature", data);
        toastHandler(response, "verifying payment signature..", "Successfully verified payment signature", "Failed to verify the payment signature");
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while verifying payment : ${err}`);
    }
})

export const getUserOrdersHistoryThunk = createAsyncThunk("orders/my-orders", async ({ userId }) => {
    try{
        const response = axiosInstance.get(`order/view/${userId}`);
        toastHandler(response, "Fetching user orders...", "Successfully fetched user orders !!", "Failed to fetch user orders !!");
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while fetching users orders : ${err}`);
    }
})


const orderSlice = createSlice({
    name : 'order',
    initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder
            .addCase(createOrderThunk.fulfilled, (state, action) => {
                state.order = action.payload.data;
            })
            .addCase(verifyPaymentThunk.fulfilled, (state, action) => {
                state.paymentStatus = action.payload.message
            })
            .addCase(getUserOrdersHistoryThunk.fulfilled, (state, action) => {
                state.userOrders = action.payload.data;
            })
    }
})

export default orderSlice.reducer;

