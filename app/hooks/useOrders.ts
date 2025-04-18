"use client"

import { useQuery } from "react-query"
import { ordersService } from "@/app/services/orders.service"
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store/store'
import { OrderStatusType } from "@/app/components/OrderStatus"

export const useOrders = () => {
  const status = useSelector((state: RootState) => state.orders.status)
  const selectedDate = useSelector((state: RootState) => state.orders.selectedDate)

  return useQuery({
    queryKey: ['orders', status, selectedDate],
    queryFn: () => ordersService.getOrders({ 
      status: status as OrderStatusType, 
      date: selectedDate 
    })
  })
}

export const useOrderSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['orders', 'search', searchTerm],
    queryFn: () => ordersService.searchOrders(searchTerm),
    enabled: !!searchTerm
  })
}