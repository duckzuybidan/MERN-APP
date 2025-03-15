import { signUpSchema, signInSchema, User, forgotPasswordSchema, profileSchema } from "@/schema";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import * as z from "zod";
type AuthState = {
    isAuthenticated: boolean
    isLoading: boolean
    isUpdating: boolean
    user: User | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    isUpdating: false,
    user: null
}

export const signUp = createAsyncThunk(
    "/sign-up",
    async (formData: z.infer<typeof signUpSchema>, {rejectWithValue}) => {
        const response = await axios.post(
            "/api/auth/sign-up",
            formData
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response;
    }
  );
export const signIn = createAsyncThunk(
    "/sign-in",
    async (formData: z.infer<typeof signInSchema>, {rejectWithValue}) => {
        const response = await axios.post(
            "/api/auth/sign-in",
            formData
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response;
    }
)
export const checkAuth = createAsyncThunk(
    "/check-auth",
    async (_, {rejectWithValue}) => {
        const response = await axios.get(
            "/api/auth/check-auth",
            {
                headers: {
                    "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",
                },
            }
        ).then((res) => res.data.user)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response;
    }
  );
export const verifyEmail = createAsyncThunk(
    "/verify-email",
    async ({token, userId}: {token: string, userId: string}, {rejectWithValue}) => {
        const response = await axios.post(
            "/api/auth/verify-email",
            {token, userId}
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response;
        
    }
)
export const resendEmailVerification = createAsyncThunk(
    "/resend-email-verification",
    async (email: string, {rejectWithValue}) => {
        const response = await axios.post(
            '/api/auth/resend-email-verification',
            {email}
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const forgotPassword = createAsyncThunk(
    "/forgot-password",
    async (formData: z.infer<typeof forgotPasswordSchema>, {rejectWithValue}) => {
        const response = await axios.post(
            '/api/auth/forgot-password',
            formData
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const resetPassword = createAsyncThunk(
    "/reset-password",
    async ({token, userId, password}: {token: string, userId: string, password: string}, {rejectWithValue}) => {
        const response = await axios.post(
            '/api/auth/reset-password',
            {token, userId, password}
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const oAuth = createAsyncThunk(
    "/oauth",
    async (_, {rejectWithValue}) => {
        const response = await axios.get(
            '/api/auth/oauth',
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
        
    }
)
export const signOut = createAsyncThunk(
    "/logout",
    async (_, {rejectWithValue}) => {
        const response = await axios.get(
            '/api/auth/logout',
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)

export const updateProfile = createAsyncThunk(
    "/update-profile",
    async (formData: z.infer<typeof profileSchema>, {rejectWithValue}) => {
        const response = await axios.put(
            '/api/auth/update-profile',
            formData
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
        
    }
)
export const deleteAddress = createAsyncThunk(
    "/delete-address",
    async (id: string, {rejectWithValue}) => {
        const response = await axios.delete(
            `/api/auth/delete-address?id=${id}`
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(signUp.pending, (state: AuthState) => {
                state.isUpdating = true
            })
            .addCase(signUp.fulfilled, (state: AuthState) => {
                state.isUpdating = false
            })
            .addCase(signUp.rejected, (state: AuthState) => {
                state.isUpdating = false
            })
            .addCase(signIn.pending, (state: AuthState) => {
                state.isUpdating = true
            })
            .addCase(signIn.fulfilled, (state: AuthState) => {
                state.isUpdating = false
                state.isAuthenticated = true
            })
            .addCase(signIn.rejected, (state: AuthState) => {
                state.isUpdating = false
            })
            .addCase(checkAuth.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
                state.isLoading = false
                state.isAuthenticated = true
                state.user = action.payload
            })
            .addCase(checkAuth.rejected, (state: AuthState) => {
                state.isLoading = false
                state.isAuthenticated = false
                state.user = null
            })
            .addCase(resetPassword.pending, (state: AuthState) => {
                state.isUpdating = true
            })
            .addCase(resetPassword.fulfilled, (state: AuthState) => {
                state.isUpdating = false
            })
            .addCase(resetPassword.rejected, (state: AuthState) => {
                state.isUpdating = false
            })
            .addCase(verifyEmail.fulfilled, (state: AuthState) => {
                state.isAuthenticated = true
            })
            .addCase(signOut.fulfilled, (state: AuthState) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(updateProfile.pending, (state: AuthState) => {
                state.isUpdating = true
            })
            .addCase(updateProfile.fulfilled, (state: AuthState, action) => {
                state.isUpdating = false
                state.user = action.payload.user
            })
            .addCase(updateProfile.rejected, (state: AuthState) => {
                state.isUpdating = false
            })
            .addCase(deleteAddress.pending, (state: AuthState) => {
                state.isUpdating = true
            })
            .addCase(deleteAddress.fulfilled, (state: AuthState, action) => {
                state.isUpdating = false
                if(!state.user) return
                state.user.addresses = state.user.addresses?.filter(address => address.id !== action.payload.address.id)
            })
            .addCase(deleteAddress.rejected, (state: AuthState) => {
                state.isUpdating = false
            })
    }
})

export default authSlice.reducer