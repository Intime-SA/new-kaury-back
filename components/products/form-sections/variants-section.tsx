"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Boxes } from "lucide-react"
import { VariantsManager } from "@/components/products/variants-manager"
import type { ProductImage, ProductVariant } from "@/types/types"

interface VariantsSectionProps {
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  stockManagement: boolean
  images: ProductImage[]
}

export function VariantsSection({ variants, onVariantsChange, stockManagement, images }: VariantsSectionProps) {
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
          images={images}
        />
      </CardContent>
    </Card>
  )
}
