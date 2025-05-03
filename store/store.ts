import { configureStore } from '@reduxjs/toolkit'
import ordersReducer from './slices/ordersSlice'
import productsReducer from './slices/productsSlice'
import productFiltersReducer from './slices/productFiltersSlice'
export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    products: productsReducer,
    productFilters: productFiltersReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 