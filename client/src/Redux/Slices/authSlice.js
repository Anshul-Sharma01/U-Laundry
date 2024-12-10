import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../Helpers/axiosInstance.js";


const initialState = {
    isLoggedIn : localStorage.getItem("isLoggedIn") === "true",
    userRole : localStorage.getItem("userRole") !== undefined ? localStorage.getItem("userRole") : "",
    userData : JSON.parse(localStorage.getItem("userData")) !== undefined ? JSON.parse(localStorage.getItem("userData")) : {},
}

const authSlice = createSlice({
    name : 'auth',
    initialState,
    reducers : {}
})

export default authSlice.reducer;

