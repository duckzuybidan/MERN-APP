import { eventSchema, productSchema } from "@/schema"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { z } from "zod"
type EventState = {
    isLoading: boolean
    isUpdating: boolean
    events: z.infer<typeof eventSchema>[] | null
}

const initialState: EventState = {
    isLoading: true,
    isUpdating: false,
    events: null,
}
export const createEvent = createAsyncThunk(
    "/create-event",
    async (data: z.infer<typeof eventSchema>, {rejectWithValue}) => {
        const response = await axios.post(
            "/api/admin/create-event",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const getAllEvents = createAsyncThunk(
    "/get-all-events",
    async (_, {rejectWithValue}) => {
        const response = await axios.get(
            "/api/admin/get-all-events"
        ).then((res) => res.data.events as z.infer<typeof eventSchema>[])
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const updateEvent = createAsyncThunk(
    "/update-event",
    async (data: z.infer<typeof eventSchema>, {rejectWithValue}) => {
        const response = await axios.put(
            "/api/admin/update-event",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const deleteEvent = createAsyncThunk(
    "/delete-event",
    async (id: string, {rejectWithValue}) => {
        const response = await axios.delete(
            `/api/admin/delete-event?id=${id}`
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {
        addProductForEvent: (state, action: PayloadAction<z.infer<typeof productSchema>>) => {
            if(!state.events) return
            state.events = state.events.map((event) => {
                if (action.payload.eventIds.includes(event.id)){
                    return {
                        ...event,
                        products: [...event.products, action.payload],
                        productIds: [...event.productIds, action.payload.id]
                    }
                }
                return event
            })
        },
        editProductForEvent: (state, action: PayloadAction<z.infer<typeof productSchema>>) => {
            if(!state.events) return
            state.events = state.events.map((event) => {
                if(action.payload.eventIds.includes(event.id) && event.productIds.includes(action.payload.id)){
                    return {
                        ...event,
                        products: event.products.map((product) => {
                            if(product.id === action.payload.id){
                                return action.payload
                            }
                            return product
                        }),
                    }
                } 
                else if (action.payload.eventIds.includes(event.id) && !event.productIds.includes(action.payload.id)){
                    return {
                        ...event,
                        products: [...event.products, action.payload],
                        productIds: [...event.productIds, action.payload.id]
                    }
                }
                else if (event.productIds.includes(action.payload.id) && !action.payload.eventIds.includes(event.id)){
                    return {
                        ...event,
                        products: event.products.filter((product) => product.id !== action.payload.id),
                        productIds: event.productIds.filter((id) => id !== action.payload.id)
                    }
                }
                return event
            })
        },
        removeProductForEvent: (state, action: PayloadAction<z.infer<typeof productSchema>>) => {
            if(!state.events) return
            state.events = state.events.map((event) => ({
                ...event,
                products: event.products.filter((product) => product.id !== action.payload.id),
                productIds: event.productIds.filter((id) => id !== action.payload.id)
            }))
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createEvent.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(createEvent.fulfilled, (state, action) => {
            state.isUpdating = false
            state.events?.push(action.payload.event)
        })
        builder.addCase(createEvent.rejected, (state) => {
            state.isUpdating = false
        })
        builder.addCase(getAllEvents.pending, (state) => {
            state.isLoading = true
        })
        builder.addCase(getAllEvents.fulfilled, (state, action: PayloadAction<z.infer<typeof eventSchema>[]>) => {
            state.isLoading = false
            state.events = action.payload
        })
        builder.addCase(getAllEvents.rejected, (state) => {
            state.isLoading = false
        })
        builder.addCase(updateEvent.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(updateEvent.fulfilled, (state, action) => {
            state.isUpdating = false
            const index = state.events?.findIndex((event) => event.id === action.payload.event.id)
            if(index === undefined || index === -1) return
            state.events![index] = action.payload.event
        })
        builder.addCase(updateEvent.rejected, (state) => {
            state.isUpdating = false
        })
        builder.addCase(deleteEvent.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(deleteEvent.fulfilled, (state, action) => {
            state.isUpdating = false
            if(!state.events) return
            state.events = state.events.filter((event) => event.id !== action.payload.id)
        })
        builder.addCase(deleteEvent.rejected, (state) => {
            state.isUpdating = false
        })
    },
})
export const { addProductForEvent, removeProductForEvent, editProductForEvent } = eventSlice.actions
export default eventSlice.reducer