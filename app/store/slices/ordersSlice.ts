import { OrderStatusType } from '@/app/components/OrderStatus'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OrdersState {
  status: OrderStatusType
  selectedDate: string
  currentPage: number
}

const initialState: OrdersState = {
  status: 'nueva',
  selectedDate: '',
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
      console.log(action.payload, 'action.payload')
      state.selectedDate = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    }
  }
})

export const { setStatus, setSelectedDate, setCurrentPage } = ordersSlice.actions
export default ordersSlice.reducer 