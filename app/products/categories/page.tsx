'use client'

import { CategoryList } from "@/components/categories/category-list"
import { ThemeProvider } from "@/providers/theme-provider"

export default function CategoriesPage() {
  return (
    <ThemeProvider>
      <div className="h-full bg-background text-foreground">
        <CategoryList />
      </div>
    </ThemeProvider>
  )
}
