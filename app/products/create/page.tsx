"use client"

import { ProductForm } from "@/components/products/product-form"

export default function CreateProductPage() {
  return (
    <div className="container mx-auto py-6 max-w-7xl bg-background text-foreground dark">
      <ProductForm context="create" />
    </div>
  )
}
