import { CartItemSchema } from "@/schema"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { z } from "zod"

type orderState = {
    isLoading: boolean,
    isUpdating: boolean,
    orders: z.infer<typeof CartItemSchema>[] | null
}

const initialState: orderState = {
    isLoading: true,
    isUpdating: false,
    orders: null
}

export const getAllOrders = createAsyncThunk(
    "/get-all-orders",
    async (_, {rejectWithValue}) => {
        const response = await axios.get(
            "/api/admin/get-all-orders"
        ).then((res) => res.data.orders as z.infer<typeof CartItemSchema>[])
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    },
)
export const verifyOrder = createAsyncThunk(
    "/verify-order",
    async (id: string, {rejectWithValue}) => {
        console.log(id)
        const response = await axios.put(
            "/api/admin/verify-order",
            {id}
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const deleteOrder = createAsyncThunk(
    "/delete-order",
    async (id: string, {rejectWithValue}) => {
        const response = await axios.delete(
            `api/admin/delete-order?id=${id}`,
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(getAllOrders.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(getAllOrders.fulfilled, (state, action) => {
            state.isLoading = false
            state.orders = action.payload
        })
        builder.addCase(getAllOrders.rejected, (state) => {
            state.isLoading = false
        })
        builder.addCase(verifyOrder.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(verifyOrder.fulfilled, (state, action) => {
            state.isUpdating = false
            if(!state.orders) return
            state.orders = state.orders?.map((order) => {
                if (order.id === action.payload.order.id) return action.payload.order
                return order
            })
        })
        builder.addCase(verifyOrder.rejected, (state) => {
            state.isUpdating = false
        })
        builder.addCase(deleteOrder.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(deleteOrder.fulfilled, (state, action) => {
            state.isUpdating = false
            if(!state.orders) return
            state.orders = state.orders?.filter((order) => order.id !== action.payload.order.id)
        })
        builder.addCase(deleteOrder.rejected, (state) => {
            state.isUpdating = false
        })
    }
})

export default orderSlice.reducer