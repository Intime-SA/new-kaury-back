import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Store } from "lucide-react"
import { ProductPreview } from "@/components/products/views/product-preview"
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
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-soft">
          <Store className="h-5 w-5" />
        </span>
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
