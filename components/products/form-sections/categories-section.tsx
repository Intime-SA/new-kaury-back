import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tags } from "lucide-react"
import { CategoriesSelector } from "@/components/categories/categories-selector"
import type { SelectedCategory } from "@/store/slices/productsSlice"

interface CategoriesSectionProps {
  selectedCategories: SelectedCategory[]
  onAddCategory: (category: SelectedCategory) => void
  onRemoveCategory: (categoryId: string) => void
  onSetCategories: (categories: SelectedCategory[]) => void
}

export function CategoriesSection({
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  onSetCategories,
}: CategoriesSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Tags className="h-10 w-10" />
        <div>
          <CardTitle>Categorías</CardTitle>
          <CardDescription>Ayudá a tus clientes a encontrar más rápido tus productos</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <CategoriesSelector
          selectedCategories={selectedCategories}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
          onSetCategories={onSetCategories}
        />
      </CardContent>
    </Card>
  )
}
