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
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary">
          <Tags className="h-5 w-5" />
        </span>
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
