import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../Helpers/axiosInstance.js";
import { toastHandler  } from "../../Helpers/toastHandler.js";

const initialState = {
    isLoggedIn : localStorage.getItem("isLoggedIn") === "true",
    userRole : localStorage.getItem("userRole") !== undefined ? localStorage.getItem("userRole") : "",
    userData : JSON.parse(localStorage.getItem("userData")) !== undefined ? JSON.parse(localStorage.getItem("userData")) : {},
}


export const registerUserThunk = createAsyncThunk("/auth/sign-in", async (data) => {
    try {
        const res = axiosInstance.post("users/register", data);
        toastHandler(res, "Creating your account...", "Account created successfully", "Failed to register user !!");
        return (await res).data;
    } catch (err) {
        console.error(`Error occurred in creating new account : ${err}`);
    }
})


export const authenticateUserThunk = createAsyncThunk("/auth/sing-in", async (data) => {
    try{
        const res = axiosInstance.post("users/login", data);
        toastHandler(res, "Authenticating your credentials...", "Logged In Successfully", "Failed to authenticate User");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while authenticating user : ${err}`);
    }
})

export const logoutUserThunk = createAsyncThunk("/auth/logout", async () => {
    try{
        const res = axiosInstance.post("users/logout");
        toastHandler(res, "logging out...", "successfully logged out", "Failed to log out");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while logging out user : ${err}`);
    }
})

export const getProfileThunk = createAsyncThunk("/user/me", async() => {
    try{
        const res = axiosInstance.post("users/me");
        toastHandler(res, "Fetching user profile ...", " Successfully fetched user profile", "Failed to fetch user profile");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while fetching user profile : ${err}`);
    }
})


const authSlice = createSlice({
    name : 'auth',
    initialState,
    reducers : {}
})

export default authSlice.reducer;

