"use client"

import { useInfiniteQuery } from "react-query"
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store/store'
import { OrderStatusType } from "@/app/components/OrderStatus"
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

export const useOrders = () => {
  const status = useSelector((state: RootState) => state.orders.status)
  const selectedDate = useSelector((state: RootState) => state.orders.selectedDate)
  const searchNumber = useSelector((state: RootState) => state.orders.searchNumber)
  const activeRequestRef = useRef<string | null>(null)

  return useInfiniteQuery<PaginatedResponse>({
    queryKey: ['orders', status, selectedDate, searchNumber],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        
        if (status) searchParams.append('status', status)
        if (selectedDate) {
          const date = new Date(selectedDate)
          const formattedDate = date.toISOString().split('T')[0]
          searchParams.append('date', formattedDate)
          // Si hay fecha seleccionada, traer todas las órdenes (50 por página)
          searchParams.append('limit', '50')
        } else {
          // Si no hay fecha, mantener paginación normal
          searchParams.append('page', pageParam.toString())
          searchParams.append('limit', '10')
        }
        if (searchNumber) searchParams.append('numberOrder', searchNumber)

        const requestKey = searchParams.toString()

        // Verificar caché reciente
        const cached = requestCache.get(requestKey)
        if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
          return cached.data
        }

        // Marcar esta petición como activa
        activeRequestRef.current = requestKey

        const response = await fetch(`${API_BASE_URL}/userOrders?${requestKey}`)
        const result = await response.json()

        if (!result.success) throw new Error(result.message)

        const finalResult = result.data?.length ? result : emptyResponse

        // Guardar en caché
        requestCache.set(requestKey, {
          timestamp: Date.now(),
          data: finalResult
        })

        // Limpiar referencia de petición activa
        activeRequestRef.current = null

        // Limpiar caché antiguo
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
    getNextPageParam: (lastPage) => {
      // Si hay fecha seleccionada, no permitir más páginas
      if (selectedDate) return undefined
      
      // Si no hay fecha, continuar con la paginación normal
      if (lastPage.pagination.page >= lastPage.pagination.totalPages) {
        return undefined
      }
      return lastPage.pagination.page + 1
    },
    keepPreviousData: false,
    refetchOnWindowFocus: false,
    staleTime: CACHE_EXPIRY,
    cacheTime: CACHE_EXPIRY
  })
}
