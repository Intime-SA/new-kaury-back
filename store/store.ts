import { configureStore } from '@reduxjs/toolkit'
import ordersReducer from './slices/ordersSlice'
import productsReducer from './slices/productsSlice'
import productFiltersReducer from './slices/productFiltersSlice'
import clientFiltersReducer from './slices/clientFiltersSlice'


export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    products: productsReducer,
    productFilters: productFiltersReducer,
    clientFilters: clientFiltersReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 