"use client"

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setStatus } from '@/store/slices/ordersSlice'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { OrderStatusType } from "@/components/orders/status/order-status"
import { Package, CreditCard, Archive, XCircle, Plus, List } from "lucide-react"
import { OrdersTabsProps } from '@/types/orders'
import { cn } from "@/lib/utils"

const tabs = [
  { value: "todas", label: "Todas", icon: List, key: null },
  { value: "nueva", label: "Nuevas", icon: Plus, key: "nueva" },
  { value: "empaquetada", label: "Empaquetadas", icon: Package, key: "empaquetada" },
  { value: "pagoRecibido", label: "Pago Recibido", icon: CreditCard, key: "pagoRecibido" },
  { value: "cancelada", label: "Canceladas", icon: XCircle, key: "cancelada" },
  { value: "archivada", label: "Archivadas", icon: Archive, key: "archivada" },
] as const

interface OrdersStatusTabsProps {
  orders: OrdersTabsProps["orders"]
  className?: string
}

export function OrdersStatusTabs({ orders, className }: OrdersStatusTabsProps) {
  const status = useSelector((state: RootState) => state.orders.status) || "todas"
  const totalAll =
    orders.nueva + orders.empaquetada + orders.pagoRecibido + orders.cancelada + orders.archivada

  return (
    <div className={cn("overflow-x-auto scroll-hidden", className)}>
      <TabsList className="inline-flex h-auto min-w-max bg-transparent border-0 shadow-none p-0 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const count = tab.key ? (orders as any)[tab.key] : totalAll
          const isActive = status === tab.value
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 whitespace-nowrap text-[13px] px-3 py-1.5 h-9"
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={
                    "ml-0.5 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold transition-colors " +
                    (isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")
                  }
                >
                  {count}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </div>
  )
}

export function OrdersTabs({ orders, content }: OrdersTabsProps) {
  const dispatch = useDispatch()
  const status = useSelector((state: RootState) => state.orders.status) || "todas"

  return (
    <Tabs value={status} onValueChange={(value) => dispatch(setStatus(value as OrderStatusType))}>
      <TabsContent value={status} className="mt-0">
        {content}
      </TabsContent>
    </Tabs>
  )
}
