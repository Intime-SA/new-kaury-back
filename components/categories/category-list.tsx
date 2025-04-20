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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground mt-1">
            Para organizar tus productos, creá categorías y subcategorías que aparecerán en el menú de la tienda.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear categoría
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categorías..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="bg-card rounded-lg shadow-sm">
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
