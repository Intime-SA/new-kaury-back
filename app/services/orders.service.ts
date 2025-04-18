import { Order } from "@/types/orders"
import { OrderStatusType } from "@/app/components/OrderStatus"

const API_BASE_URL = "http://localhost:3000/api"

export const ordersService = {
  getOrders: async ({ status, date }: { status?: OrderStatusType; date?: string } = {}) => {
    let url = `${API_BASE_URL}/userOrders`
    const params = new URLSearchParams()
    
    if (status) params.append('status', status)
    if (date) params.append('date', date)
    
    if (params.toString()) url += `?${params.toString()}`
    
    const response = await fetch(url)
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  },

  searchOrders: async (searchTerm: string) => {
    const response = await fetch(`${API_BASE_URL}/userOrders/search?number=${searchTerm}`)
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    return result.data
  }
} 