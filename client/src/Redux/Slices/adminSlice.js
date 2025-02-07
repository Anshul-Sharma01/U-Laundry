import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance.js";
import { toastHandler } from "../../Helpers/toastHandler.js";

const initialState = {
    allOrders : [],
}

export const fetchAllOrdersThunk = createAsyncThunk("admin/fetch-all-orders", async() => {
    try{
        const response = axiosInstance.get(`order/getall`);
        toastHandler(response, "Fetching all orders...", "Successfully fetched all orders", "Failed to fetch all orders");
        return (await response).data;
    }catch(err){
        console.error(`Error occurred while fetching all orders`);
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
            })
    }
})

export default adminSlice.reducer;

