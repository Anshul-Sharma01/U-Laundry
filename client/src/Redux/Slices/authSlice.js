import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../Helpers/axiosInstance.js";
import { toastHandler  } from "../../Helpers/toastHandler.js";

const initialState = {
    isLoggedIn : localStorage.getItem("isLoggedIn") === "true",
    userRole : localStorage.getItem("userRole") !== undefined ? localStorage.getItem("userRole") : "",
    userData : JSON.parse(localStorage.getItem("userData")) !== undefined ? JSON.parse(localStorage.getItem("userData")) : {},
    isCodeVerified : localStorage.getItem("isCodeVerified") || false
}

const updateLocalStorage = (user) => {
    localStorage.setItem("userData", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", user?.role || "");
    localStorage.setItem("isCodeVerified", user?.isCodeVerified);
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


export const authenticateUserThunk = createAsyncThunk("/auth/sing-in", async ({ email, password }) => {
    try{
        console.log("email", email);
        const res = axiosInstance.post("users/login", { email, password });
        toastHandler(res, "Authenticating your credentials...", "Logged In Successfully", "Failed to authenticate User");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while authenticating user : ${err}`);
    }
})

export const verifyCodeThunk = createAsyncThunk("/auth/verify-code", async ({ email, verifyCode }) => {
    try {
        const res =  axiosInstance.post("users/verify-code", { email, verifyCode });
        toastHandler(res, "Verifying OTP", "Successfully LoggedIn", "Failed to verify code, please try again");
        console.log((await res));
        return (await res).data;
    } catch (err) {
        console.error(`Error occurred while verifying verification code: ${err}`);
        // console.log("Error occurred : ", err);
        // if (err.response) {
        //     throw new Error(err.response.data.message || "Failed to verify code, please try again");
        // } else {
        //     throw new Error("An unexpected error occurred");
        // }
    }
});

export const requestNewVerificationCodeThunk = createAsyncThunk("/auth/request-new-code", async ({ email }) => {
    try{
        // console.log("email :-- ", email);
        const res = axiosInstance.post("users/request-new-code", {email});
        toastHandler(res, "Requesting new verification code...", "Successfully sent the new verification code", "Failed to request for new verification code");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while requesting new verification code : ${err}`);    
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

export const resetPasswordThunk = createAsyncThunk("/auth/reset", async({email}) => {
    try{
        const res = axiosInstance.patch(`users/reset`, email);
        toastHandler(res, 'wait for a moment...', `Successfully sent email to ${email}`, "Failed to sent the email");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while resetting password : ${err}`);
    }
})

export const resetPasswordTokenThunk = createAsyncThunk("/auth/reset/:resetToken", async(data) => {
    try{
        const res = axiosInstance.patch(`users/reset/${data.resetToken}`, data);
        toastHandler(res, "updating your password", "password updated successfully", "failed to reset the password");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while resetting password : ${err}`);
    }
})

export const changePasswordThunk = createAsyncThunk("/auth/change-password", async({ oldPassword, newPassword }) => {
    try {
        const res = axiosInstance.patch("users/change-password", { oldPassword, newPassword});
        toastHandler(res, "changing your password...", "password changed successfully", "failed to change the password");
        return (await res).data;
    } catch (err) {
        console.error(`Error occurred while changing password : ${err}`);
    }
})

export const updateUserDetailsThunk = createAsyncThunk("/user/update-details", async(data) => {
    try{
        const res = axiosInstance.patch("users/update", data);
        toastHandler(res, "updating profile details", "successfully updated profile ", "failed to update the profile");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while updating user details : ${err}`);
    }
})

export const updateUserAvatarThunk = createAsyncThunk("/user/update-avatar", async(data) => {
    try{
        const res = axiosInstance.patch("users/update-avatar", data);
        toastHandler(res, "updating avatar...", "avatar updated successfully", "failed to update avatar");
        return (await res).data;
    }catch(err){
        console.error(`Error occurred while updating user Avatar : ${err}`);
    }
})


const authSlice = createSlice({
    name : 'auth',
    initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder
            .addCase(registerUserThunk.fulfilled, (state, action) => {
                if(action?.payload?.statusCode === 201){
                    const user = action?.payload?.data?.user;
                    updateLocalStorage(user);
                    state.isLoggedIn = true;
                    state.userData = user;
                    state.userRole = user?.role || "";
                    state.isCodeVerified = user?.isCodeVerified || false
                }
            })
            .addCase(registerUserThunk.rejected, (state, action) => {
                localStorage.clear();
                state.userData = {},
                state.isLoggedIn = false;
                state.userRole = "";
                state.isCodeVerified = false;
            })
            .addCase(verifyCodeThunk.fulfilled, (state, action) => {
                if(action?.payload?.statusCode === 200){
                    const user = action?.payload?.data?.user;
                    updateLocalStorage(user);
                    state.isLoggedIn = true;
                    state.userData = user;
                    state.userRole = user?.role;
                    state.isCodeVerified = user?.isCodeVerified || true;
                }
            })
            .addCase(verifyCodeThunk.rejected, (state, action) => {
                localStorage.clear();
                state.userData = {},
                state.isLoggedIn = false;
                state.userRole = "";
                state.isCodeVerified = false
            })
            .addCase(logoutUserThunk.fulfilled, (state, action) => {
                if(action?.payload?.statusCode === 200){
                    localStorage.clear();
                    state.isLoggedIn = false;
                    state.userData = {};
                    state.userRole = "";
                    state.isCodeVerified = false
                }
            })
            .addCase(updateUserDetailsThunk.fulfilled, (state, action) => {
                if(action?.payload?.statusCode === 200){
                    localStorage.setItem("userData", JSON.stringify(action?.payload?.data));
                    state.userData = action?.payload?.data;
                }
            })
            .addCase(updateUserAvatarThunk.fulfilled, (state, action) => {
                if(action?.payload?.statusCode === 200){
                    localStorage.setItem("userData", JSON.stringify(action?.payload?.data));
                    state.userData = action?.payload?.data;
                }
            })
    }
})

export default authSlice.reducer;

