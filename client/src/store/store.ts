import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import webInterfaceReducer from "./web-interface-slice";
import categorySlice from "./admin-slice/category";
import productSlice from "./admin-slice/product";
import eventSlice from "./admin-slice/event";
import adminOthersSlice from "./admin-slice/others";
import userSlice from "./user-slice";
import orderSlice from "./admin-slice/order";
const store = configureStore({
    reducer: {
        auth: authReducer,
        webInterface: webInterfaceReducer,
        category: categorySlice,
        product: productSlice,
        event: eventSlice,
        adminOthers: adminOthersSlice,
        user: userSlice,
        order: orderSlice
    },
});

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;