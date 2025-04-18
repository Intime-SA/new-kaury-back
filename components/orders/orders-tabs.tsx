"use client"

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/app/store/store'
import { setStatus } from '@/app/store/slices/ordersSlice'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { OrderStatusType } from "@/app/components/OrderStatus"
import { Package, CreditCard, Truck, Archive, XCircle, Plus, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface OrdersTabsProps {
  orders: {
    nueva: number
    empaquetada: number
    pagoRecibido: number
    enviada: number
    cancelada: number
    archivada: number
  }
  content: ReactNode
}

export function OrdersTabs({ orders, content }: OrdersTabsProps) {
  const dispatch = useDispatch()
  const status = useSelector((state: RootState) => state.orders.status) || "todas"

  return (
    <Tabs value={status} onValueChange={(value) => dispatch(setStatus(value as OrderStatusType))}>
      <div className="mb-4">
        <TabsList className="w-full grid grid-cols-6 gap-2">
          <TabsTrigger value="todas" className="flex items-center justify-center gap-2">
            <List className="h-4 w-4" />
            Todas
            {status === "todas" && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {orders.nueva + orders.empaquetada + orders.pagoRecibido + orders.cancelada + orders.archivada}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="nueva" className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevas
            {status === "nueva" && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {orders.nueva}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="empaquetada" className="flex items-center justify-center gap-2">
            <Package className="h-4 w-4" />
            Empaquetadas
            {status === "empaquetada" && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {orders.empaquetada}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pagoRecibido" className="flex items-center justify-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pago Recibido
            {status === "pagoRecibido" && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {orders.pagoRecibido}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelada" className="flex items-center justify-center gap-2">
            <XCircle className="h-4 w-4" />
            Canceladas
            {status === "cancelada" && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {orders.cancelada}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="archivada" className="flex items-center justify-center gap-2">
            <Archive className="h-4 w-4" />
            Archivadas
            {status === "archivada" && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {orders.archivada}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value={status}>
        {content}
      </TabsContent>
    </Tabs>
  )
} 