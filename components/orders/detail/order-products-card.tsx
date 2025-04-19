"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import type { OrderItem } from "@/types/orders"
import { Hash, Ruler, Palette, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"

interface OrderProductsCardProps {
  items: OrderItem[]
  onClose?: () => void
}

export function OrderProductsCard({ items, onClose }: OrderProductsCardProps) {
  // Generar un identificador único para cada item si no tiene id
  const itemsWithKeys = useMemo(() => 
    items.map((item, index) => ({
      ...item,
      uniqueKey: item.id || `${item.name}-${index}-${Date.now()}`
    }))
  , [items])

  return (
    <Card className="border border-[#1F1F1F] w-full relative">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 p-0 border-none"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      )}
      <CardContent className="p-4 max-h-[400px] overflow-auto custom-scrollbar w-full">
        <div className="space-y-4 w-full">
          {itemsWithKeys.map((item) => (
            <div key={item.uniqueKey} className="flex flex-col gap-2 pb-4 border-b border-[#1F1F1F] last:border-0 last:pb-0 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    {item.image && (
                      <Image
                        src={Array.isArray(item.image) ? item.image[0] : item.image}
                        alt={item.name || 'Producto'}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="font-xs font-[10%] font-semibold line-clamp-2 text-ellipsis max-w-[200px]"># {item.name || 'Producto sin nombre'}</p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  ${(item.unit_price || 0).toLocaleString("es-ES", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 justify-center border-r border-[#1F1F1F] first:pl-0">
                  <Hash className="h-4 w-4" />
                  <span>{item.quantity || 0}</span>
                </div>
                <div className="flex items-center gap-2 justify-center border-r border-[#1F1F1F]">
                  <Ruler className="h-4 w-4" />
                  <span>{item.talle || '-'}</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Palette className="h-4 w-4" />
                  <span>{item.color || '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 