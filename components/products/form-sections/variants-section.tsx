"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Boxes } from "lucide-react"
import { VariantsManager } from "@/components/products/variants-manager"
import type { ProductImage, ProductVariant } from "@/types/types"

interface VariantsSectionProps {
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  stockManagement: boolean
  initialUseGlobalPrices?: boolean
  onUseGlobalPricesChange: (value: boolean) => void
  initialGlobalUnitPrice?: string | null
  onGlobalUnitPriceChange: (value: string) => void
  initialGlobalPromotionalPrice?: string | null
  onGlobalPromotionalPriceChange: (value: string) => void
  initialGlobalCost?: string | null
  onGlobalCostChange: (value: string) => void
}

export function VariantsSection({ 
  variants, 
  onVariantsChange, 
  stockManagement, 
  initialUseGlobalPrices,
  onUseGlobalPricesChange,
  initialGlobalUnitPrice,
  onGlobalUnitPriceChange,
  initialGlobalPromotionalPrice,
  onGlobalPromotionalPriceChange,
  initialGlobalCost,
  onGlobalCostChange
}: VariantsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Boxes className="h-10 w-10" />
        <div>
          <CardTitle>Variantes y precios</CardTitle>
          <CardDescription>Configura las variantes, precios y stock de tu producto</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <VariantsManager
          variants={variants}
          onChange={onVariantsChange}
          stockManagement={stockManagement}
          initialUseGlobalPrices={initialUseGlobalPrices}
          onUseGlobalPricesChange={onUseGlobalPricesChange}
          initialGlobalUnitPrice={initialGlobalUnitPrice}
          onGlobalUnitPriceChange={onGlobalUnitPriceChange}
          initialGlobalPromotionalPrice={initialGlobalPromotionalPrice}
          onGlobalPromotionalPriceChange={onGlobalPromotionalPriceChange}
          initialGlobalCost={initialGlobalCost}
          onGlobalCostChange={onGlobalCostChange}
        />
      </CardContent>
    </Card>
  )
}
