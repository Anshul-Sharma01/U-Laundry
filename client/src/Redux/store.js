import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./Slices/authSlice.js";
import orderSliceReducer from "./Slices/orderSlice.js";

const store = configureStore({
    reducer : {
        auth : authSliceReducer,
        order : orderSliceReducer
    }
})

export default store;
