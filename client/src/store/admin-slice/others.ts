import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

type AdminOthersState = {
    isLoading: boolean
    isUpdating: boolean
    adminEmails: string[]
}
const initialState: AdminOthersState = {
    isLoading: false,
    isUpdating: false,
    adminEmails: []
}
export const getAllAdminEmails = createAsyncThunk(
    "/get-all-admin-emails",
    async (_, {rejectWithValue}) => {
        const response = await axios.get(
            "/api/admin/get-all-admin-emails"
        ).then((res) => res.data.emails)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const addAdminEmail = createAsyncThunk(
    "/add-admin-email",
    async (email: string, {rejectWithValue}) => {
        const response = await axios.put(
            "/api/admin/add-admin-email",
            {email}
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }   
)
const adminOthersSlice = createSlice({
    name: 'adminOthers',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(getAllAdminEmails.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(getAllAdminEmails.fulfilled, (state, action) => {
            state.isLoading = false
            state.adminEmails = action.payload
        })
        builder.addCase(getAllAdminEmails.rejected, (state) => {
            state.isLoading = false
        })
        builder.addCase(addAdminEmail.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(addAdminEmail.fulfilled, (state, action) => {
            state.isUpdating = false
            state.adminEmails.push(action.payload.email)
        })
        builder.addCase(addAdminEmail.rejected, (state) => {
            state.isUpdating = false
        })
    }
})
export default adminOthersSlice.reducer