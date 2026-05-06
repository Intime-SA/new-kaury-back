"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import type { OrderItem } from "@/types/orders"
import { Hash, Ruler, Palette, X, Gift } from "lucide-react"
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
    <Card className="relative w-full overflow-hidden">
      {onClose && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 text-white"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      <CardContent className="p-3 max-h-[400px] overflow-auto custom-scrollbar w-full">
        <div className="space-y-2 w-full">
          {itemsWithKeys.map((item) => (
            <div
              key={item.uniqueKey}
              className={
                "relative rounded-xl border p-3 transition-colors " +
                (item.isGift
                  ? "border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10"
                  : "border-border/60 bg-muted/20 hover:bg-muted/40")
              }
            >
              {item.isGift && (
                <span className="absolute -top-2 left-3 inline-flex items-center gap-1 rounded-full bg-pink-500 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-pop">
                  <Gift className="h-2.5 w-2.5" />
                  REGALO
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted ring-1 ring-border/60">
                    {item.image && (
                      <Image
                        src={Array.isArray(item.image) ? item.image[0] : item.image}
                        alt={item.name || 'Producto'}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {item.name || 'Producto sin nombre'}
                    </p>
                    {item.isGift && (
                      <p className="mt-0.5 text-[10px] font-medium text-pink-600 inline-flex items-center gap-1">
                        <Gift className="h-2.5 w-2.5" /> Incluido como regalo
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-card border border-border/60 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        {item.quantity || 0}
                      </span>
                      {(item.talle || item.TALLE) && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-card border border-border/60 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          <Ruler className="h-3 w-3" />
                          {item.talle || item.TALLE}
                        </span>
                      )}
                      {(item.color || item.COLOR) && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-card border border-border/60 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          <Palette className="h-3 w-3" />
                          {item.color || item.COLOR}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {item.isGift ? (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-600 px-2 py-1 text-[11px] font-bold whitespace-nowrap">
                    GRATIS
                  </span>
                ) : (
                  <p className="shrink-0 text-sm font-bold text-foreground whitespace-nowrap">
                    {(item.unit_price || 0).toLocaleString("es-ES", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
