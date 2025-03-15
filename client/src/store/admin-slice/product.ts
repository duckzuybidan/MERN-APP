import { eventSchema, productSchema, ProductWithPage } from "@/schema"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { z } from "zod"

type ProductState = {
    isLoading: boolean
    isUpdating: boolean
    isFetching: boolean
    products: ProductWithPage[] | null
    cachedSearchProducts: {
        key: string
        products: z.infer<typeof productSchema>[]
    }[],
    cachedFetchProducts: z.infer<typeof productSchema>[],
    productsPerPage: number,
    totalPages: number
}

const initialState: ProductState = {
    isLoading: true,
    isUpdating: false,
    isFetching: false,
    products: null,
    cachedSearchProducts: [],
    cachedFetchProducts: [],
    productsPerPage: 20,
    totalPages: 0
}
export const createProduct = createAsyncThunk(
    "/create-product",
    async (data: z.infer<typeof productSchema>, {rejectWithValue}) => {
        const response = await axios.post(
            "/api/admin/create-product",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const getTotalPages = createAsyncThunk(
    "/get-total-pages",
    async (limit: number, {rejectWithValue}) => {
        const response = await axios.get(
            `/api/admin/get-total-pages?limit=${limit}`
        ).then((res) => res.data.totalPages)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const getAllProducts = createAsyncThunk(
    "/get-all-products",
    async ({
        page, 
        limit, 
        query, 
        category,
        priceOrder,
        priceMin,
        priceMax,
        updateAtOrder
    }: {
        page?: number,
        limit?: number,
        query?: string,
        category?: string,
        priceOrder?: ProductWithPage["priceOrder"],
        priceMin?: ProductWithPage["priceMin"],
        priceMax?: ProductWithPage["priceMax"],
        updateAtOrder?: ProductWithPage["updatedAtOrder"]
    }, {rejectWithValue}) => {
        const response = await axios.get(
            `/api/admin/get-all-products` + 
            `?page=${page || 1}` +
            `&limit=${limit || initialState.productsPerPage}` +
            `&query=${query || ""}` +
            `&category=${category || ""}` +
            `&price_order=${priceOrder || "none"}` +
            `&price_min=${priceMin || 1}` +
            `&price_max=${priceMax || 1000000}` + 
            `&updateAt_order=${updateAtOrder || "none"}`
        ).then((res) => res.data.products as ProductWithPage)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const getProductById = createAsyncThunk(
    "/get-product-by-id",
    async (id: string, {rejectWithValue}) => {
        const response = await axios.get(
            `/api/admin/get-product-by-id?id=${id}`
        ).then((res) => res.data.product)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const updateProduct = createAsyncThunk(
    "/update-product",
    async (data: z.infer<typeof productSchema>, {rejectWithValue}) => {
        const response = await axios.put(
            "/api/admin/update-product",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const deleteProduct = createAsyncThunk(
    "/delete-product",
    async (id: string, {rejectWithValue}) => {
        const response = await axios.delete(
            `/api/admin/delete-product?id=${id}`
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        cacheSearchProducts: (state, action: PayloadAction<{key: string, products: z.infer<typeof productSchema>[]}>) => {
            state.cachedSearchProducts = [...state.cachedSearchProducts, action.payload]
        },
        addEventForProduct: (state, action: PayloadAction<z.infer<typeof eventSchema>>) => {
            if(!state.products) return
            state.products = state.products.map((product) => ({
                ...product,
                products: product.products.map((p) => {
                    if (action.payload.productIds.includes(p.id)) {
                        return {...p, eventIds: [...p.eventIds, action.payload.id]}
                    }
                    return p
                })
            }))
        },
        editEventForProduct: (state, action: PayloadAction<z.infer<typeof eventSchema>>) => {
            if(!state.products) return
            state.products = state.products.map((product) => ({
                ...product,
                products: product.products.map((p) => {
                    if (action.payload.productIds.includes(p.id) && !p.eventIds.includes(action.payload.id)) {
                        return {...p, eventIds: [...p.eventIds, action.payload.id]}
                    }
                    else if (!action.payload.productIds.includes(p.id) && p.eventIds.includes(action.payload.id)) {
                        return {...p, eventIds: p.eventIds.filter((id) => id !== action.payload.id)}
                    }
                    return p
                })
            }))
        },
        removeEventForProduct: (state, action: PayloadAction<z.infer<typeof eventSchema>>) => {
            if(!state.products) return
            state.products = state.products.map((product) => ({
                ...product,
                products: product.products.map((p) => {
                    return {...p, events: p.eventIds.filter((id) => id !== action.payload.id)}
                })
            }))
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createProduct.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(createProduct.fulfilled, (state, action) => {
            state.isUpdating = false
            const firstPage = state.products?.find((product) => product.page === 1)
            if (!firstPage) return
            firstPage.products = [action.payload.product, ...firstPage.products]
            state.products = state.products?.map((product) => {
                if (product.page === 1) return firstPage
                return product
            }) || null
        })
        builder.addCase(createProduct.rejected, (state) => {
            state.isUpdating = false
        })
        builder.addCase(getAllProducts.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(getAllProducts.fulfilled, (state, action: PayloadAction<ProductWithPage>) => {
            state.isLoading = false
            const findPage = state.products?.find((product) => 
                product.page === action.payload.page && 
                product.query === action.payload.query &&
                product.filterCategory === action.payload.filterCategory &&
                product.priceOrder === action.payload.priceOrder &&
                product.priceMin === action.payload.priceMin &&
                product.priceMax === action.payload.priceMax &&
                product.updatedAtOrder === action.payload.updatedAtOrder
            )
            if (findPage) {
                findPage.products = action.payload.products
                return
            }
            state.products = state.products ? [...state.products, action.payload] : [action.payload]
        })
        builder.addCase(getAllProducts.rejected, (state) => {
            state.isLoading = false
        })
        builder.addCase(getProductById.pending, (state) => {
            state.isFetching = true
        })
        builder.addCase(getProductById.fulfilled, (state, action: PayloadAction<z.infer<typeof productSchema>>) => {
            state.isFetching = false
            state.cachedFetchProducts = [...state.cachedFetchProducts, action.payload]
        })
        builder.addCase(getProductById.rejected, (state) => {
            state.isFetching = false
        })
        builder.addCase(updateProduct.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(updateProduct.fulfilled, (state, action) => {
            state.isUpdating = false
            const findPage = state.products?.find((product) => {
                const findItem = product.products.find((item) => item.id === action.payload.product.id)
                if (findItem) return product
            })
            if (!findPage) return
            findPage.products = findPage.products.map((product) => {
                if (product.id === action.payload.product.id) return action.payload.product
                return product
            })
            state.products = state.products?.map((product) => {
                if (product.page === findPage.page) return findPage
                return product
            }) || null
        })
        builder.addCase(updateProduct.rejected, (state) => {
            state.isUpdating = false
        })
        builder.addCase(getTotalPages.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(getTotalPages.fulfilled, (state, action: PayloadAction<number>) => {
            state.isLoading = false
            state.totalPages = action.payload
        })
        builder.addCase(getTotalPages.rejected, (state) => {
            state.isLoading = false
        })
        builder.addCase(deleteProduct.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(deleteProduct.fulfilled, (state, action) => {
            state.isUpdating = false
            const findPage = state.products?.find((product) => {
                const findItem = product.products.find((item) => item.id === action.payload.product.id)
                if (findItem) return product
            })
            if (!findPage) return   
            findPage.products = findPage.products.filter((product) => product.id !== action.payload.product.id)
            state.products = state.products?.map((product) => {
                if (product.page === findPage.page) return findPage
                return product
            }) || null
        })
        builder.addCase(deleteProduct.rejected, (state) => {
            state.isUpdating = false
        })
    }
})

export const { cacheSearchProducts, addEventForProduct, editEventForProduct, removeEventForProduct } = productSlice.actions
export default productSlice.reducer