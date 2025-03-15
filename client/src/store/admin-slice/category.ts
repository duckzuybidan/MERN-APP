import { categorySchema } from "@/schema"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { z } from "zod"

type CategoryState = {
    isLoading: boolean
    isUpdating: boolean
    categories: z.infer<typeof categorySchema>[] | undefined
}

const initialState: CategoryState = {
    isLoading: true,
    isUpdating: false,
    categories: undefined,
}

export const getAllCategories = createAsyncThunk(
    "/get-all-categories",
    async (_, {rejectWithValue}) => {
        const response = await axios.get(
            "/api/admin/get-all-categories"
        ).then((res) => res.data.categories as z.infer<typeof categorySchema>[])
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const createCategory = createAsyncThunk(
    "/create-category",
    async (data: z.infer<typeof categorySchema>, {rejectWithValue}) => {
        const response = await axios.post(
            "/api/admin/create-category",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const updateCategory = createAsyncThunk(
    "/update-category",
    async (data: z.infer<typeof categorySchema>, {rejectWithValue}) => {
        const response = await axios.put(
            "/api/admin/update-category",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const getCategoryBySlug = createAsyncThunk(
    "/get-category-by-slug",
    async (slug: string, {rejectWithValue}) => {
        const response = await axios.get(
            `/api/admin/get-category-by-slug?slug=${slug}`
        ).then((res) => res.data.category)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const deleteCategory = createAsyncThunk(
    "/delete-category",
    async (id: string, {rejectWithValue}) => {
        const response = await axios.delete(
            `/api/admin/delete-category?id=${id}`
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(getAllCategories.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(getAllCategories.fulfilled, (state, action: PayloadAction<z.infer<typeof categorySchema>[]>) => {
            state.isLoading = false
            state.categories = action.payload
        })
        builder.addCase(getAllCategories.rejected, (state) => {
            state.isLoading = false
        })
        builder.addCase(createCategory.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(createCategory.fulfilled, (state, action) => {
            state.isUpdating = false
            state.categories?.push(action.payload.category as z.infer<typeof categorySchema>)
        })
        builder.addCase(createCategory.rejected, (state) => {
            state.isUpdating = false
        })
        builder.addCase(updateCategory.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(updateCategory.fulfilled, (state, action) => {
            state.isUpdating = false
            const index = state.categories?.findIndex((category) => category.id === action.payload.category.id)
            if(index === undefined || index === -1) return
            state.categories![index] = action.payload.category
        })
        builder.addCase(updateCategory.rejected, (state) => {
            state.isUpdating = false
        })
        builder.addCase(getCategoryBySlug.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(getCategoryBySlug.fulfilled, (state) => {
            state.isLoading = false
        })
        builder.addCase(getCategoryBySlug.rejected, (state) => {
            state.isLoading = false
        })
        builder.addCase(deleteCategory.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(deleteCategory.fulfilled, (state, action) => {
            state.isUpdating = false
            const index = state.categories?.findIndex((category) => category.id === action.payload.category.id)
            if(index === undefined || index === -1) return
            state.categories!.splice(index, 1)
        })
        builder.addCase(deleteCategory.rejected, (state) => {
            state.isUpdating = false
        })
    }
})

export default categorySlice.reducer