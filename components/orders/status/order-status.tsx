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
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  nueva: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20',
    dot: 'bg-warning',
  },
  empaquetada: {
    label: 'Empaquetada',
    icon: Package,
    className: 'bg-info/10 text-info border-info/20',
    dot: 'bg-info',
  },
  pagoRecibido: {
    label: 'Recibido',
    icon: CreditCard,
    className: 'bg-success/10 text-success border-success/20',
    dot: 'bg-success',
  },
  enviada: {
    label: 'En Distribución',
    icon: Truck,
    className: 'bg-success/10 text-success border-success/20',
    dot: 'bg-success',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    dot: 'bg-destructive',
  },
  archivada: {
    label: 'Archivada',
    icon: Archive,
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
}

export function OrderStatus({ status }: OrderStatusProps) {
  if (!status) return null
  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-all gap-1.5 select-none cursor-default",
          config.className
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
        <span>{config.label}</span>
      </div>
    </div>
  )
}
