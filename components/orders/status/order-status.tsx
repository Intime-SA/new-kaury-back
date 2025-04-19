'use client'

import { cn } from "@/lib/utils"
import { Clock, Package, CreditCard, Truck, XCircle, Archive } from "lucide-react"

export type OrderStatusType = 'nueva' | 'empaquetada' | 'pagoRecibido' | 'enviada' | 'cancelada' | 'archivada' | 'todas' | null

export interface OrderStatusProps {
  status: OrderStatusType
}

const statusConfig = {
  todas: {
    label: 'Todas',
    icon: Clock,
    className: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-secondary/30 shadow-secondary/30',
  },
  nueva: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-yellow-500/90 text-white hover:bg-yellow-500 border-yellow-600/30 shadow-yellow-500/30',
  },
  empaquetada: {
    label: 'Empaquetada',
    icon: Package,
    className: 'bg-blue-500/90 text-white hover:bg-blue-500 border-blue-600/30 shadow-blue-500/30',
  },
  pagoRecibido: {
    label: 'Recibido',
    icon: CreditCard,
    className: 'bg-green-500/90 text-white hover:bg-green-500 border-green-600/30 shadow-green-500/30',
  },
  enviada: {
    label: 'En Distribución',
    icon: Truck,
    className: 'bg-green-500/90 text-white hover:bg-green-500 border-green-600/30 shadow-green-500/30',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-red-500/90 text-white hover:bg-red-500 border-red-600/30 shadow-red-500/30',
  },
  archivada: {
    label: 'Archivada',
    icon: Archive,
    className: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-secondary/30 shadow-secondary/30',
  },
}

export function OrderStatus({ status }: OrderStatusProps) {
  if (!status) return null
  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-center">
      <div 
        className={cn(
          "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none gap-2 shadow-[0_2px_10px] cursor-default",
          config.className
        )}
      >
        <config.icon className="h-4 w-4" />
        <span>{config.label}</span>
      </div>
    </div>
  )
} 