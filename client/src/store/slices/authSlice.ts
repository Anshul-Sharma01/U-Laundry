import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helpers/axiosInstance';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserAvatar {
    public_id: string;
    secure_url: string;
}

interface User {
    _id: string;
    username: string;
    name: string;
    email: string;
    fatherName: string;
    studentId: number;
    hostelName: string;
    roomNumber: string;
    degreeName: string;
    avatar: UserAvatar;
    role?: string;
    isVerified?: boolean;
    verificationStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    isHydrating: boolean;   // true during the initial session-restore request
    otpSent: boolean;
    otpEmail: string;
    error: string;
    successMessage: string;
}

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
    'auth/register',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('users/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('users/login', credentials);
            return data;
        } catch (err: any) {
            const response = err.response?.data;
            // Pass verification status for special handling
            if (err.response?.status === 403 && response?.data?.verificationStatus) {
                return rejectWithValue({
                    message: response.message,
                    verificationStatus: response.data.verificationStatus,
                });
            }
            return rejectWithValue(response?.message || 'Login failed');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload: { email: string; verifyCode: string }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('users/verify-code', payload);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
        }
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (email: string, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('users/request-new-code', { email });
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP');
        }
    }
);

/**
 * getProfile — used by AuthHydrator on every app load.
 * Calls GET /users/me → verifyJWT → hydrateAuth → returns the full user object.
 * If the access token is expired, axiosInstance automatically tries to refresh it.
 * If refresh also fails, the request rejects silently (user stays logged-out).
 */
export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.get('users/me');
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Session expired');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('users/logout');
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Logout failed');
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState: AuthState = {
    user: null,
    isLoggedIn: false,
    isLoading: false,
    isHydrating: true,   // start as true — will flip to false after first getProfile resolves
    otpSent: false,
    otpEmail: '',
    error: '',
    successMessage: '',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthMessages: (state) => {
            state.error = '';
            state.successMessage = '';
        },
        resetOtpState: (state) => {
            state.otpSent = false;
            state.otpEmail = '';
        },
    },
    extraReducers: (builder) => {
        // ── Register ──
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = '';
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ── Login ──
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = '';
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.otpSent = true;
                state.successMessage = action.payload.message;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                const payload = action.payload as any;
                state.error = typeof payload === 'string' ? payload : payload?.message || 'Login failed';
            })

            // ── Verify OTP ──
            .addCase(verifyOtp.pending, (state) => {
                state.isLoading = true;
                state.error = '';
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isLoggedIn = true;
                state.user = action.payload.data.user;
                state.otpSent = false;
                state.otpEmail = '';
                state.successMessage = action.payload.message;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ── Resend OTP ──
            .addCase(resendOtp.pending, (state) => {
                state.isLoading = true;
                state.error = '';
            })
            .addCase(resendOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ── Get Profile (Auth Hydration) ──
            .addCase(getProfile.pending, (state) => {
                state.isHydrating = true;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isHydrating = false;
                state.isLoading = false;
                state.isLoggedIn = true;
                state.user = action.payload.data;
            })
            .addCase(getProfile.rejected, (state) => {
                // Not an error — user simply has no valid session
                state.isHydrating = false;
                state.isLoading = false;
                state.isLoggedIn = false;
                state.user = null;
            })

            // ── Logout ──
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isLoggedIn = false;
                state.otpSent = false;
                state.otpEmail = '';
            });
    },
});

export const { clearAuthMessages, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
