import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./Slices/authSlice.js";
import orderSliceReducer from "./Slices/orderSlice.js";
import adminSliceReducer from "./Slices/adminSlice.js";

const store = configureStore({
    reducer : {
        auth : authSliceReducer,
        order : orderSliceReducer,
        admin : adminSliceReducer
    }
})

export default store;
