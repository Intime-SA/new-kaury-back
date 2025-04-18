"use client"

import { useState } from "react"
import { OrdersTable } from "@/components/orders/orders-table"
import { useOrders } from "@/app/hooks/useOrders"
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/app/store/store'
import { setCurrentPage } from '@/app/store/slices/ordersSlice'

function OrdersPageContent() {
  const [ordersPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const dispatch = useDispatch()
  const { currentPage } = useSelector((state: RootState) => state.orders)

  const { data: orders = [], isLoading } = useOrders()

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

  const paginate = (pageNumber: number) => dispatch(setCurrentPage(pageNumber))

  return (
    <OrdersTable
      orders={orders}
      currentOrders={currentOrders}
      ordersLength={orders.length}
      currentPage={currentPage}
      ordersPerPage={ordersPerPage}
      searchTerm={searchTerm}
      loading={isLoading}
      setSearchTerm={setSearchTerm}
      paginate={paginate}
    />
  )
}

export default function OrdersPage() {
  return (
    <div className="p-6">
      <OrdersPageContent />
    </div>
  )
}
