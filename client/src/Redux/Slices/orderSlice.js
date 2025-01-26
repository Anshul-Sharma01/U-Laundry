import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance.js";
import { toast } from "react-hot-toast";


const initialState = {
    order : null,
    orders : [],
    paymentStatus : null
}


export const createOrder = createAsyncThunk("orders/create-order", async(data) => {
    try{
        const response = axiosInstance.post("order/add", data);
        toast.promise(response, {
            loading : "Creating new order ...",
            success : (data) => data?.data?.message,
            error : "Failed to create a new order"
        })
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while creating a new order : ${err}`);
    }
})


export const verifyPayment = createAsyncThunk("order/verifyPayment", async(data) => {
    try{
        const response = await axiosInstance.post("order/verify-signature", data);
        toast.promise(response, {
            loading : "verifying payment signature..",
            success : (data) => data?.data?.message,
            error : "Failed to verify the payment signature"
        });
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while verifying payment : ${err}`);
    }
})


const orderSlice = createSlice({
    name : 'order',
    initialState,
    reducers : {
        resetPaymentStatus : (state) => {
            state.paymentStatus = null;
        },
    },
    extraReducers : (builder) => {
        builder
            .addCase(createOrder.fulfilled, (state, action) => {
                state.order = action.payload.data;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.paymentStatus = action.payload.message
            })
    }
})

export const { resetPaymentStatus } = orderSlice.actions;
export default orderSlice.reducer;

