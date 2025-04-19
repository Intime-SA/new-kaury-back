"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store/store'
import { OrderStatusType } from "@/components/orders/status/order-status"
import { useRef } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

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

// Cache para almacenar las últimas peticiones
const requestCache = new Map<string, {
  timestamp: number,
  data: PaginatedResponse
}>()

// Tiempo de expiración del caché (2 segundos)
const CACHE_EXPIRY = 2000

interface UpdateBulkStatusParams {
  orderIds: string[];
  newStatus: OrderStatusType;
}

export const useOrders = () => {
  const status = useSelector((state: RootState) => state.orders.status)
  const selectedDate = useSelector((state: RootState) => state.orders.selectedDate)
  const searchNumber = useSelector((state: RootState) => state.orders.searchNumber)
  const activeRequestRef = useRef<string | null>(null)
  const queryClient = useQueryClient()

  const updateOrderStatus = useMutation(
    async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatusType }) => {
      const response = await fetch(`${API_BASE_URL}/userOrders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!data.success) {
        throw {
          title: 'Error al actualizar estado',
          description: data.message,
          action: `${status} → ${newStatus}`
        }
      }

      return data.data
    },
    {
      onSuccess: (updatedOrder) => {
        queryClient.setQueryData(
          ['orders', status, selectedDate, searchNumber],
          (oldData: any) => {
            if (!oldData?.pages) return oldData

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data: page.data.map((order: any) => 
                  order.id === updatedOrder.id ? updatedOrder : order
                )
              }))
            }
          }
        )
      },
    }
  )

  const updateBulkOrderStatus = useMutation({
    mutationFn: async ({ orderIds, newStatus }: UpdateBulkStatusParams) => {
      const response = await fetch(`${API_BASE_URL}/userOrders/bulk/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el estado de las órdenes');
      }

      return response.json();
    },
    onSuccess: (data, { orderIds, newStatus }) => {
      queryClient.setQueryData(
        ['orders', status, selectedDate, searchNumber],
        (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((order: any) => 
                orderIds.includes(order.id) 
                  ? { ...order, status: newStatus }
                  : order
              )
            }))
          };
        }
      );
    },
  });

  return {
    ...useInfiniteQuery(
      ['orders', status, selectedDate, searchNumber],
      async ({ pageParam = 1 }) => {
        try {
          const searchParams = new URLSearchParams()
          
          if (status) searchParams.append('status', status)
          if (selectedDate) {
            const date = new Date(selectedDate)
            const formattedDate = date.toISOString().split('T')[0]
            searchParams.append('date', formattedDate)
            searchParams.append('limit', '50')
          } else {
            searchParams.append('page', pageParam.toString())
            searchParams.append('limit', '10')
          }
          if (searchNumber) searchParams.append('numberOrder', searchNumber)

          const requestKey = searchParams.toString()

          const cached = requestCache.get(requestKey)
          if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
            return cached.data
          }

          activeRequestRef.current = requestKey

          const response = await fetch(`${API_BASE_URL}/userOrders?${requestKey}`)
          const result = await response.json()

          if (!result.success) throw new Error(result.message)

          const finalResult = result.data?.length ? result : emptyResponse

          requestCache.set(requestKey, {
            timestamp: Date.now(),
            data: finalResult
          })

          activeRequestRef.current = null

          Array.from(requestCache.entries()).forEach(([key, value]) => {
            if (Date.now() - value.timestamp > CACHE_EXPIRY) {
              requestCache.delete(key)
            }
          })

          return finalResult
        } catch (error) {
          console.error('Error fetching orders:', error)
          activeRequestRef.current = null
          return emptyResponse
        }
      },
      {
        getNextPageParam: (lastPage: PaginatedResponse) => {
          if (selectedDate) return undefined
          
          if (lastPage.pagination.page >= lastPage.pagination.totalPages) {
            return undefined
          }
          return lastPage.pagination.page + 1
        },
        keepPreviousData: false,
        refetchOnWindowFocus: false,
        staleTime: CACHE_EXPIRY,
        cacheTime: CACHE_EXPIRY,
        // Evitar refetch automático después de la mutación
        refetchOnMount: false,
        refetchOnReconnect: false
      }
    ),
    updateOrderStatus,
    updateBulkOrderStatus
  }
}
