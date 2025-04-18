import { OrderStatusType } from '@/app/components/OrderStatus'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OrdersState {
  status: OrderStatusType
  selectedDate: string | null
  searchNumber: string
  currentPage: number
}

const initialState: OrdersState = {
  status: 'todas',
  selectedDate: null,
  searchNumber: '',
  currentPage: 1
}

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<OrderStatusType>) => {
      state.status = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
    setSearchNumber: (state, action: PayloadAction<string>) => {
      state.searchNumber = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    }
  }
})

export const { setStatus, setSelectedDate, setSearchNumber, setCurrentPage } = ordersSlice.actions
export default ordersSlice.reducer 