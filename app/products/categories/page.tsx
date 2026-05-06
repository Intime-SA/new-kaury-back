'use client'

import { CategoryList } from "@/components/categories/category-list"
import { ThemeProvider } from "@/providers/theme-provider"

export default function CategoriesPage() {
  return (
    <ThemeProvider>
      <CategoryList />
    </ThemeProvider>
  )
}
