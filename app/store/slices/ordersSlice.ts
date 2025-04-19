import { OrderStatusType } from '@/components/orders/status/order-status'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Order } from '@/types/orders'

interface OrdersState {
  status: OrderStatusType
  selectedDate: string | null
  searchNumber: string
  currentPage: number
  selectedOrders: Order[]
  isAllSelected: boolean
}

const initialState: OrdersState = {
  status: 'todas',
  selectedDate: null,
  searchNumber: '',
  currentPage: 1,
  selectedOrders: [],
  isAllSelected: false
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
    },
    toggleOrderSelection: (state, action: PayloadAction<Order>) => {
      const index = state.selectedOrders.findIndex(order => order.id === action.payload.id)
      if (index === -1) {
        state.selectedOrders.push(action.payload)
      } else {
        state.selectedOrders.splice(index, 1)
      }
    },
    toggleAllOrders: (state, action: PayloadAction<Order[]>) => {
      state.isAllSelected = !state.isAllSelected
      if (state.isAllSelected) {
        state.selectedOrders = action.payload
      } else {
        state.selectedOrders = []
      }
    },
    clearSelectedOrders: (state) => {
      state.selectedOrders = []
      state.isAllSelected = false
    }
  }
})

export const { 
  setStatus, 
  setSelectedDate, 
  setSearchNumber, 
  setCurrentPage,
  toggleOrderSelection,
  toggleAllOrders,
  clearSelectedOrders
} = ordersSlice.actions

export default ordersSlice.reducer 