"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, EyeOff, Trash2, GripVertical, MoreVertical, ChevronRight, Eye, Pencil, Trash } from "lucide-react"
import { CategoryDialog } from "./category-dialog"
import { useCategories, type Category } from "@/hooks/categories/useCategories"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "../ui/use-toast" 
import { Badge } from "@/components/ui/badge"

interface CategoriesManagerProps {
  searchTerm: string
}

export function CategoriesManager({ searchTerm }: CategoriesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    deleteSubcategory,
  } = useCategories()

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCreateCategory = () => {
    setSelectedCategory(null)
    setSelectedParentCategory(null)
    setIsDialogOpen(true)
  }

  const handleCreateSubcategory = (parent: Category) => {
    setSelectedCategory(null)
    setSelectedParentCategory(parent)
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category, parentCategory: Category | null = null) => {
    setSelectedCategory(category)
    setSelectedParentCategory(parentCategory)
    setIsDialogOpen(true)
  }

  const handleSaveCategory = async (categoryData: Omit<Category, "id" | "subcategories">) => {
    try {
      if (selectedCategory) {
        await updateCategory({
          id: selectedCategory.id,
          parentId: selectedParentCategory?.id,
          ...categoryData,
        })
      } else if (selectedParentCategory) {
        await createSubcategory({
          parentId: selectedParentCategory.id,
          ...categoryData,
        })
      } else {
        await createCategory(categoryData)
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al guardar la categoría:", error)
    }
  }

  const handleDeleteCategory = async (categoryId: string, parentId?: string) => {
    try {
      if (parentId) {
        await deleteSubcategory({ parentId, subcategoryId: categoryId })
      } else {
        await deleteCategory(categoryId)
      }
    } catch (error) {
      console.error("Error al eliminar la categoría:", error)
    }
  }

  const handleToggleVisibility = async (category: Category, parentId?: string) => {
    try {
      if (parentId) {
        // Si tiene parentId, es una subcategoría
        updateCategory({
          id: category.id,
          parentId: parentId,
          visible: !category.visible,
          name: category.name,
          description: category.description,
          image: category.image
        })
      } else {
        // Si no tiene parentId, es una categoría principal
        updateCategory({
          id: category.id,
          visible: !category.visible,
          name: category.name,
          description: category.description,
          image: category.image
        })
      }
      toast({
        title: "Éxito",
        description: "Visibilidad actualizada correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la visibilidad",
        variant: "destructive"
      })
    }
  }

  const searchInCategory = (category: Category, term: string): boolean => {
    // Buscar en el nombre de la categoría
    if (category.name.es.toLowerCase().includes(term)) return true
    
    // Buscar en la descripción si existe
    if (category.description?.es.toLowerCase().includes(term)) return true
    
    // Buscar en subcategorías
    return category.subcategories.some(sub => 
      sub.name.es.toLowerCase().includes(term) || 
      sub.description?.es.toLowerCase().includes(term)
    )
  }

  const filterCategories = (cats: Category[], term: string): Category[] => {
    if (!term) return cats

    return cats
      .filter(cat => searchInCategory(cat, term))
      .map(cat => ({
        ...cat,
        subcategories: cat.subcategories.filter(sub => 
          sub.name.es.toLowerCase().includes(term) ||
          sub.description?.es.toLowerCase().includes(term)
        )
      }))
  }

  const filteredAndSortedCategories = useMemo(() => {
    const filtered = filterCategories(categories, searchTerm.toLowerCase())
    return filtered.sort((a, b) => {
      if (a.visible && !b.visible) return -1
      if (!a.visible && b.visible) return 1
      return a.name.es.localeCompare(b.name.es)
    })
  }, [categories, searchTerm])

  if (isLoading) {
    return <div className="p-6">Cargando categorías...</div>
  }

  const renderCategoryCard = (category: Category) => (
    <Card 
      key={category.id} 
      className={cn(
        "relative w-full",
        !category.visible && "bg-muted/30"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-none w-40 h-40 rounded-lg overflow-hidden flex items-center justify-center",
            "bg-muted dark:bg-[#09090B]"
          )}>
            {category.image ? (
              <img
                src={category.image}
                alt={category.name.es}
                className="w-auto h-auto max-w-full max-h-full object-contain"
              />
            ) : (
              <GripVertical className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{category.name.es}</h3>
                {category.subcategories.some(sub => !sub.visible) && (
                  <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                    <EyeOff className="h-3 w-3" />
                    <span>Subcategorías ocultas</span>
                  </Badge>
                )}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleVisibility(category)}
                  >
                    {category.visible ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {category.subcategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCategory(category.id)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedCategories.has(category.id) && "transform rotate-90"
                      )}
                    />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCreateSubcategory(category)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear subcategoría
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {category.description?.es && (
              <p className="text-sm text-muted-foreground mt-1">{category.description.es}</p>
            )}
          </div>
        </div>

        {category.subcategories.length > 0 && expandedCategories.has(category.id) && (
          <div className="mt-4 pl-44 border-t pt-4">
            <div className="space-y-2">
              {category.subcategories
                .sort((a, b) => {
                  if (a.visible && !b.visible) return -1
                  if (!a.visible && b.visible) return 1
                  return a.name.es.localeCompare(b.name.es)
                })
                .map((subcategory: Category) => (
                  <div
                    key={subcategory.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg bg-muted/5",
                      !subcategory.visible && "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {subcategory.image && (
                        <div className={cn(
                          "w-10 h-10 rounded overflow-hidden flex items-center justify-center",
                          "bg-muted dark:bg-[#09090B]"
                        )}>
                          <img
                            src={subcategory.image}
                            alt={subcategory.name.es}
                            className="w-auto h-auto max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subcategory.name.es}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleToggleVisibility(subcategory, category.id)}
                          >
                            {subcategory.visible ? (
                              <Eye className="h-3 w-3 text-green-500" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-red-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditCategory(subcategory, category)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteCategory(subcategory.id, category.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      {filteredAndSortedCategories.map((category) => renderCategoryCard(category))}

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory ?? undefined}
        onSave={handleSaveCategory}
      />
    </div>
  )
}
