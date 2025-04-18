"use client"

import { useInfiniteQuery } from "react-query"
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store/store'
import { OrderStatusType } from "@/app/components/OrderStatus"

const API_BASE_URL = "http://localhost:3000/api"

interface PaginatedResponse {
  success: boolean
  data: any[]
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
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const emptyResponse: PaginatedResponse = {
  success: true,
  data: [],
  reports: {
    current: {
      totalSales: 0,
      totalAmount: 0,
      averageSale: 0
    },
    previous: {
      totalSales: 0,
      totalAmount: 0,
      averageSale: 0
    },
    percentageChange: {
      totalSales: 0,
      totalAmount: 0,
      averageSale: 0
    }
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  }
}

export const useOrders = () => {
  const status = useSelector((state: RootState) => state.orders.status)
  const selectedDate = useSelector((state: RootState) => state.orders.selectedDate)
  const searchNumber = useSelector((state: RootState) => state.orders.searchNumber)

  return useInfiniteQuery<PaginatedResponse>({
    queryKey: ['orders', status, selectedDate, searchNumber],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        
        if (status) searchParams.append('status', status)
        if (selectedDate) searchParams.append('date', selectedDate)
        if (searchNumber) searchParams.append('numberOrder', searchNumber)
        searchParams.append('page', pageParam.toString())
        searchParams.append('limit', '10')

        const response = await fetch(`${API_BASE_URL}/userOrders?${searchParams.toString()}`)
        const result = await response.json()
        
        if (!result.success) throw new Error(result.message)
        
        return result.data?.length ? result : emptyResponse
      } catch (error) {
        console.error('Error fetching orders:', error)
        return emptyResponse
      }
    },
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined
  })
}
