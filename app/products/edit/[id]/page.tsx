"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProductForm } from "@/components/products/product-form"
import { Product } from "@/types/types"

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = null/* await getProduct(params.id as string) */
        setProduct(productData)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-7xl bg-background text-foreground dark">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6 max-w-7xl bg-background text-foreground dark">
        <div className="flex justify-center items-center h-[50vh]">
          <p>Producto no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl bg-background text-foreground dark">
      <ProductForm context="edit" product={product} />
    </div>
  )
}
