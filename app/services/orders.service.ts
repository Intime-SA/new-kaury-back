import { Order } from "@/types/orders"
import { OrderStatusType } from "../components/OrderStatus"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface GetOrdersParams {
  status?: OrderStatusType
  date?: string
  
  searchNumber?: string
  page?: number
  cursor?: number | null
}

interface PaginatedResponse {
  data: Order[]
  reports?: {
    current: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
    previous: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
    percentageChange: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
  }
  pagination: {
    hasNext: boolean
    page: number
  }
}

class OrdersService {
  async getOrders(params: GetOrdersParams = {}): Promise<PaginatedResponse> {
    try {
      const { status, date, cursor } = params
      const searchParams = new URLSearchParams()
      
      if (status) searchParams.append('status', status)
      if (date) searchParams.append('date', date)
      if (cursor) searchParams.append('cursor', cursor.toString())

      const response = await fetch(`${API_BASE_URL}/userOrders?${searchParams.toString()}`)
      const result = await response.json()
      
      if (!result.success) throw new Error(result.message)
      
      return {
        reports: result.reports,
        data: result.data,
        pagination: {
          hasNext: result.pagination?.hasNext || false,
          page: result.pagination?.page || 1
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  async getActiveOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/userOrders?status=active`)
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      return result.data
    } catch (error) {
      console.error("Error fetching active orders:", error)
      throw error
    }
  }

  async getArchivedOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/userOrders?status=archivada`)
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      return result.data
    } catch (error) {
      console.error("Error fetching archived orders:", error)
      throw error
    }
  }

  async getCancelledOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/userOrders?status=cancelada`)
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      return result.data
    } catch (error) {
      console.error("Error fetching cancelled orders:", error)
      throw error
    }
  }
}

export const ordersService = new OrdersService() 