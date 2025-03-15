import { webInterfaceSchema } from "@/schema"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { z } from "zod"

type WebInterfaceState = {
    isLoading: boolean
    isUpdating: boolean
    webInterfaceData: z.infer<typeof webInterfaceSchema> | null
}

const initialState: WebInterfaceState = {
    isLoading: true,
    isUpdating: false,
    webInterfaceData: null
}
export const loadWebInterface = createAsyncThunk(
    "/load-web-interface",
    async (_, {rejectWithValue}) => {
        const url = `${import.meta.env.VITE_WEB_INTERFACE_BASEURL}/v${new Date().getTime()}/web.json`
        const response = await axios.get(
            url,{
                withCredentials: false
            }
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
export const updateWebInterface = createAsyncThunk(
    "/update-web-interface",
    async (data: z.infer<typeof webInterfaceSchema>, {rejectWithValue}) => {
        const response = await axios.put(
            "/api/admin/update-web-interface",
            data
        ).then((res) => res.data)
        .catch((err) => {
            return rejectWithValue(err.response.data)
        })
        return response
    }
)
const webInterfaceSlice = createSlice({
    name: "webInterface",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(loadWebInterface.fulfilled, (state, action: PayloadAction<z.infer<typeof webInterfaceSchema>>) => {
            state.isLoading = false
            state.webInterfaceData = action.payload
        })
        builder.addCase(updateWebInterface.pending, (state) => {
            state.isUpdating = true
        })
        builder.addCase(updateWebInterface.fulfilled, (state) => {
            state.isUpdating = false
        })
        builder.addCase(updateWebInterface.rejected, (state) => {
            state.isUpdating = false
        })
    }
    
})
export const {  } = webInterfaceSlice.actions
export default webInterfaceSlice.reducer