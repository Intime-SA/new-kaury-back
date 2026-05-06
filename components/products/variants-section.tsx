"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Boxes } from "lucide-react"
import { VariantsManager } from "@/components/products/form-sections/variants-manager"
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
  onDialogOpenChange: (value: boolean) => void
  isDialogOpen: boolean
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
  onGlobalCostChange,
  isDialogOpen,
  onDialogOpenChange
}: VariantsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-pop">
          <Boxes className="h-5 w-5" />
        </span>
        <div>
          <CardTitle>Variantes y precios</CardTitle>
          <CardDescription>Configurá las variantes, precios y stock de tu producto</CardDescription>
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
          onDialogOpenChange={onDialogOpenChange}
          isDialogOpen={isDialogOpen}
        />
      </CardContent>
    </Card>
  )
}
