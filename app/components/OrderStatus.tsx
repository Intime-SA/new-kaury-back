'use client'

import { cn } from "@/lib/utils"
import { Clock, Package, CreditCard, Truck, XCircle, Archive } from "lucide-react"

export type OrderStatusType = 'nueva' | 'empaquetada' | 'pagoRecibido' | 'enviada' | 'cancelada' | 'archivada'

export interface OrderStatusProps {
  status: OrderStatusType
}

const statusConfig = {
  nueva: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
  },
  empaquetada: {
    label: 'Empaquetada',
    icon: Package,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
  },
  pagoRecibido: {
    label: 'Pago Recibido',
    icon: CreditCard,
    className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  },
  enviada: {
    label: 'En Distribución',
    icon: Truck,
    className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200',
  },
  archivada: {
    label: 'Archivada',
    icon: Archive,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
  },
}

export function OrderStatus({ status }: OrderStatusProps) {
  const config = statusConfig[status]

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none gap-1",
        config.className
      )}
    >
      <config.icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  )
} 