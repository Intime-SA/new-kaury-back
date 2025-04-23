import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Store } from "lucide-react"
import { ProductPreview } from "@/components/products/product-preview"
import type { ProductImage, ProductVariant } from "@/types/types"
import type { SelectedCategory } from "@/store/slices/productsSlice"

interface PreviewSectionProps {
  name: string
  description: string
  price: number
  discountPrice: number | null
  tags: string[]
  categories: SelectedCategory[]
  freeShipping: boolean
  variants: ProductVariant[]
  videoURL: string | null
}

export function PreviewSection({
  name,
  description,
  price,
  discountPrice,
  tags,
  categories,
  freeShipping,
  variants,
  videoURL,
}: PreviewSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Store className="h-10 w-10" />
        <div>
          <CardTitle>Vista previa</CardTitle>
          <CardDescription>Así se verá tu producto en la tienda</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ProductPreview
          name={name}
          description={description}
          price={price}
          discountPrice={discountPrice}
          tags={tags}
          categories={categories}
          freeShipping={freeShipping}
          variants={variants}
          videoURL={videoURL}
        />
      </CardContent>
    </Card>
  )
}
