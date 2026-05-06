"use client"

import { ProductForm } from "@/components/products/product-form"

export default function CreateProductPage() {
  return (
    <div className="container mx-auto py-6 max-w-7xl animate-fade-up">
      <ProductForm context="create" />
    </div>
  )
}
