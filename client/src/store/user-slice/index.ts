import { CartItemSchema, CartSchema } from "@/schema"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { z } from "zod"

type UserState = {
    isCartLoading: boolean
    isCartUpdating: boolean
    cart: z.infer<typeof CartSchema> | null
}

const initialState: UserState = {
    isCartLoading: true,
    isCartUpdating: false,
    cart: null
}

export const addToCart = createAsyncThunk(
    "/add-to-cart",
    async (data: {
        userId: string
        itemId: string
        quantity: string
        phone: string
        addressId: string
        paymentMethod: z.infer<typeof CartItemSchema>["paymentMethod"]
        price: string
    }, {rejectWithValue}) => {
        const response = await axios.post(
            "/api/user/add-to-cart",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const getCartByUserId = createAsyncThunk(
    "/get-cart-by-user-id",
    async (userId: string, {rejectWithValue}) => {
        const response = await axios.get(
            `/api/user/get-cart-by-user-id?userId=${userId}`
        ).then((res) => res.data.cart as z.infer<typeof CartSchema>)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const updateCartItemInfo = createAsyncThunk(
    "/update-cart-item-info",
    async (data: {
        cartItemId: string
        phone: string
        addressId: string
        paymentMethod: z.infer<typeof CartItemSchema>["paymentMethod"]
    }, {rejectWithValue}) => {
        const response = await axios.put(
            "/api/user/update-cart-item-info",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const deleteCartItem = createAsyncThunk(
    "/delete-cart-item",
    async (id: string, {rejectWithValue}) => {
        const response = await axios.delete(
            `/api/user/delete-cart-item?id=${id}`
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(addToCart.pending, (state) => {
            state.isCartUpdating = true
        })
        builder.addCase(addToCart.fulfilled, (state, action) => {
            state.isCartUpdating = false
            state.cart = action.payload.cart
        })
        builder.addCase(addToCart.rejected, (state) => {
            state.isCartUpdating = false
        })
        builder.addCase(getCartByUserId.pending, (state) => {
            state.isCartLoading = true
        })
        builder.addCase(getCartByUserId.fulfilled, (state, action: PayloadAction<z.infer<typeof CartSchema>>) => {
            state.isCartLoading = false
            state.cart = action.payload
        })
        builder.addCase(getCartByUserId.rejected, (state) => {
            state.isCartLoading = false
        })
        builder.addCase(updateCartItemInfo.pending, (state) => {
            state.isCartUpdating = true
        })
        builder.addCase(updateCartItemInfo.fulfilled, (state, action) => {
            state.isCartUpdating = false
            if(!state.cart) return
            state.cart = {
                ...state.cart,
                cartItems: state.cart.cartItems.map((cartItem) => {
                    if(cartItem.id === action.payload.cartItem.id) {
                        return action.payload.cartItem
                    }
                    return cartItem
                })
            }
        })
        builder.addCase(updateCartItemInfo.rejected, (state) => {
            state.isCartUpdating = false
        })
        builder.addCase(deleteCartItem.pending, (state) => {
            state.isCartUpdating = true
        })
        builder.addCase(deleteCartItem.fulfilled, (state, action) => {
            state.isCartUpdating = false
            if(!state.cart) return
            state.cart = {
                ...state.cart,
                cartItems: state.cart.cartItems.filter((cartItem) => cartItem.id !== action.payload.cartItem.id)
            }
        })
        builder.addCase(deleteCartItem.rejected, (state) => {
            state.isCartUpdating = false
        })
    }
})
export default userSlice.reducer