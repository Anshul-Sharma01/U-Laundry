import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./Slices/authSlice.js";

const store = configureStore({
    reducer : {
        auth : authSliceReducer
    }
})

export default store;
