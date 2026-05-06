"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GripVertical, ChevronDown, ChevronRight, MoreVertical, Plus, Edit, EyeOff, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { CategoryDialog } from "./category-dialog"
import { CategoriesManager } from "./categories-manager"
import { useCategories, type Category } from "@/hooks/categories/useCategories"

interface CategoryData {
  id: string
  name: {
    es: string
  }
  subcategories: CategoryData[]
  visible?: boolean
}

interface CategoryListProps {
  categories: CategoryData[]
  parentId?: string
  level?: number
  onCreateSubcategory: (category: CategoryData) => void
  onEditCategory: (category: CategoryData) => void
  onDeleteCategory: (categoryId: string, parentId?: string) => void
  onToggleVisibility: (categoryId: string, parentId?: string) => void
}

export function CategoryList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { createCategory } = useCategories()

  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'subcategories'>) => {
    await createCategory(categoryData)
    setIsDialogOpen(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase())
  }

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-up">
      <div className="flex flex-wrap gap-3 justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Organizá tus productos creando categorías y subcategorías que aparecerán en el menú de la tienda.
          </p>
        </div>
        <Button variant="gradient" onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear categoría
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categorías..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card shadow-soft overflow-hidden">
        <CategoriesManager searchTerm={searchTerm} />
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveCategory}
      />
    </div>
  )
}
