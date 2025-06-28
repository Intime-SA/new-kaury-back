"use client"

import React, { useRef, useEffect } from 'react'
import { useCategories, type Category } from "@/hooks/categories/useCategories"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectedCategory } from "@/store/slices/productsSlice"
import { Badge } from "@/components/ui/badge"

interface CategoriesSelectorProps {
  selectedCategories: SelectedCategory[]
  onAddCategory: (category: SelectedCategory) => void
  onRemoveCategory: (categoryId: string) => void
  onSetCategories: (categories: SelectedCategory[]) => void
}

export function CategoriesSelector({ 
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  onSetCategories
}: CategoriesSelectorProps) {
  const { categories, isLoading } = useCategories()
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set())
  const checkboxRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const isSelected = (categoryId: string) => {
    return selectedCategories.some((cat: SelectedCategory) => cat.id === categoryId)
  }

  const hasSelectedSubcategory = (category: Category) => {
    return category.subcategories.some(sub => isSelected(sub.id))
  }

  useEffect(() => {
    // Actualizar el estado indeterminado de los checkboxes
    categories.forEach(category => {
      const checkbox = checkboxRefs.current[category.id]
      if (checkbox) {
        const hasSubSelected = hasSelectedSubcategory(category)
        // @ts-ignore
        checkbox.indeterminate = hasSubSelected && !isSelected(category.id)
      }
    })
  }, [selectedCategories, categories])

  const handleToggleCategory = (category: Category, parentId?: string) => {
    const selectedCategory: SelectedCategory = {
      id: category.id,
      name: {
        es: category.name.es
      },
      parentId
    }

    // Si ya está seleccionada, la deseleccionamos
    if (isSelected(category.id)) {
      onRemoveCategory(category.id)
      return
    }

    // Si estamos seleccionando una subcategoría, también marcamos la categoría padre como seleccionada
    if (parentId) {
      const parentCategory = categories.find(cat => cat.id === parentId)
      if (parentCategory && !isSelected(parentCategory.id)) {
        onAddCategory({
          id: parentCategory.id,
          name: {
            es: parentCategory.name.es
          }
        })
      }
    }

    // Seleccionamos la nueva categoría
    onAddCategory(selectedCategory)
  }

  if (isLoading) {
    return <div>Cargando categorías...</div>
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4"></TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Categoría</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category.id)
              const hasSubcategories = category.subcategories.length > 0
              const hasSubSelected = hasSelectedSubcategory(category)

              return (
                <React.Fragment key={category.id}>
                  {/* Fila de categoría principal */}
                  <TableRow 
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      (isSelected(category.id) || hasSubSelected) && "bg-muted"
                    )}
                  >
                    <TableCell className="w-4">
                      {hasSubcategories && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(category.id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="w-12">
                      <Checkbox
                        ref={(el) => {
                          checkboxRefs.current[category.id] = el
                        }}
                        checked={isSelected(category.id) || hasSubSelected}
                        onCheckedChange={() => handleToggleCategory(category)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name.es}
                    </TableCell>
                  </TableRow>

                  {/* Filas de subcategorías */}
                  {isExpanded && category.subcategories.map((subcategory) => {
                    return (
                      <TableRow
                        key={subcategory.id}
                        className={cn(
                          "transition-colors hover:bg-muted/50",
                          isSelected(subcategory.id) && "bg-muted"
                        )}
                      >
                        <TableCell className="pl-4"></TableCell>
                        <TableCell className="pl-10">
                          <Checkbox
                            checked={isSelected(subcategory.id)}
                            onCheckedChange={() => handleToggleCategory(subcategory, category.id)}
                          />
                        </TableCell>
                        <TableCell className="pl-10">    
                          {subcategory.name.es}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="text-sm text-muted-foreground min-h-[40px] pt-2">
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCategories
              .filter(cat => !cat.parentId)
              .map(mainCategory => {
                const subCategory = selectedCategories.find(sub => sub.parentId === mainCategory.id)
                
                const badgeText = subCategory
                  ? `${mainCategory.name.es} / ${subCategory.name.es}`
                  : mainCategory.name.es

                return (
                  <Badge key={mainCategory.id} variant="secondary">
                    {badgeText}
                  </Badge>
                )
              })}
          </div>
        ) : (
          <p>Selecciona una o más categorías para tu producto</p>
        )}
      </div>
    </div>
  )
} 