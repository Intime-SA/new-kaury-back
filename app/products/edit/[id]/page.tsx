"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useDispatch } from "react-redux"
import { ProductForm } from "@/components/products/product-form"
import { Product, ProductCategory } from "@/types/types"
import { setFormData, type SelectedCategory, type ProductFormState } from "@/store/slices/productsSlice"
import { useProducts } from "@/hooks/products/useProducts"

const transformCategoriesForRedux = (apiCategories: ProductCategory[]): SelectedCategory[] => {
  const reduxCategories: SelectedCategory[] = []
  apiCategories.forEach((mainCat) => {
    reduxCategories.push({ id: mainCat.id, name: mainCat.name })
    if (mainCat.subcategories && mainCat.subcategories.length > 0) {
      mainCat.subcategories.forEach((subCat) => {
        reduxCategories.push({
          id: subCat.id,
          name: subCat.name,
          parentId: mainCat.id,
        })
      })
    }
  })
  return reduxCategories
}

const transformProductToFormState = (product: Product): Partial<ProductFormState> => {
  return {
    name: product.name,
    description: product.description,
    published: product.published,
    freeShipping: product.freeShipping,
    productType: product.variants[0]?.stockManagement ? "physical" : "digital",
    stockManagement: product.variants[0]?.stockManagement ? "limited" : "infinite",
    images: product.images,
    variants: product.variants,
    categories: transformCategoriesForRedux(product.categories || []),
    tags: product.tags,
    urls: product.urls,
    sku: product.sku,
    barcode: product.barcode,
    dimensions: {
      weight: product.dimensions?.weight ?? '',
      width: product.dimensions?.width ?? '',
      height: product.dimensions?.height ?? '',
      depth: product.dimensions?.depth ?? '',
    },
    mpn: product.mpn,
    ageRange: product.ageRange,
    gender: product.gender,
    showInStore: product.showInStore,
  }
}

export default function EditProductPage() {
  const params = useParams()
  const dispatch = useDispatch()
  const { getProductById } = useProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const productId = params.id as string
      if (!productId) {
        setError("No se proporcionó ID de producto.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const productData = await getProductById(productId)
        if (productData) {
          setProduct(productData)
          const formStateData = transformProductToFormState(productData)
          dispatch(setFormData(formStateData))
        } else {
          setError("Producto no encontrado.")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError(err instanceof Error ? err.message : "Error al buscar el producto.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, dispatch, getProductById])

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-7xl bg-background text-foreground dark">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-7xl bg-background text-foreground dark">
        <div className="flex justify-center items-center h-[50vh]">
          <p className="text-red-500">Error: {error}</p>
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
