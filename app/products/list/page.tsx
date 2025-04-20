"use client"

import React, { Suspense } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from 'next/image'
import Link from 'next/link'
import { ProductImage, ProductVariant } from '@/types/types'
import { useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setCategories } from '@/store/slices/productsSlice'
import { Checkbox } from '@/components/ui/checkbox'
import { useQuery } from 'react-query'

interface Category {
  id: string
  name: {
    es: string
  }
}

interface Product {
  id: string
  name: {
    es: string
  }
  published: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  categories: Category[]
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ApiResponse {
  status: string
  data: {
    products: Product[]
    pagination: Pagination
  }
}

function ProductListContent() {
  const dispatch = useDispatch()
  const selectedCategories = useSelector((state: RootState) => state.products.categories)
  const searchParams = useSearchParams()
  const [expandedProducts, setExpandedProducts] = React.useState<Set<string>>(new Set())

  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const { data: response, isLoading, error } = useQuery<ApiResponse>(
    ['products', page, limit, category, search],
    async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?page=${page}&limit=${limit}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`)
      if (!res.ok) {
        throw new Error('Error al cargar los productos')
      }
      return res.json()
    }
  )

  const products = response?.data.products
  const pagination = response?.data.pagination

  const toggleExpand = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const handleCategoryToggle = (category: Category) => {
    const isSelected = selectedCategories.some(cat => cat.id === category.id)
    
    if (isSelected) {
      dispatch(setCategories(selectedCategories.filter(cat => cat.id !== category.id)))
    } else {
      dispatch(setCategories([...selectedCategories, {
        id: category.id,
        name: category.name
      }]))
    }
  }

  console.log(products?.[0]?.images[0].src)

  if (isLoading) {
    return <div>Cargando productos...</div>
  }

  if (error) {
    return <div>Error al cargar los productos</div>
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/products/create">
          <Button>Crear Producto</Button>
        </Link>
      </div>

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4"></TableHead>
              <TableHead className="w-[100px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="w-[100px]">Visible</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product: Product) => {
              const isExpanded = expandedProducts.has(product.id)
              const hasVariants = product.variants.length > 1

              return (
                <React.Fragment key={product.id}>
                  {/* Fila principal del producto */}
                  <TableRow className={cn(
                    "transition-colors hover:bg-muted/50",
                    isExpanded && "bg-muted/50"
                  )}>
                    <TableCell>
                      {hasVariants && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(product.id)}
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
                    <TableCell>
                      {product.images[0] && (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden">
                          <Image
                            src={product.images[0].src}
                            alt={product.name.es}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name.es}
                    </TableCell>
                    <TableCell>
                      {formatPrice(product.variants[0]?.unit_price || 0)}
                    </TableCell>
                    <TableCell>
                      {product.categories.map((category: Category) => (
                        <Badge key={category.id} variant="secondary" className="mr-1">
                          {category.name.es}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {product.published ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Filas de variantes */}
                  {isExpanded && product.variants.map((variant: ProductVariant) => (
                    <TableRow
                      key={variant.id}
                      className="bg-muted/25"
                    >
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="relative w-12 h-12 rounded-md overflow-hidden">
                          <Image
                            src={variant.imageId 
                              ? product.images.find(img => img.id.toString() === variant.imageId)?.src ?? "/placeholder.svg"
                              : product.images[0]?.src ?? "/placeholder.svg"}
                            alt={variant.value}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="pl-4">
                        <div className="text-sm">
                          <p className="font-medium">{variant.value || "Variante principal"}</p>
                          <p className="text-muted-foreground">
                            SKU: {variant.sku || "No definido"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{formatPrice(variant.unit_price)}</p>
                          {variant.promotionalPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(variant.promotionalPrice)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        {variant.stockManagement ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Paginación */}
      {pagination && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', (pagination.page - 1).toString())
              window.location.href = `?${params.toString()}`
            }}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', (pagination.page + 1).toString())
              window.location.href = `?${params.toString()}`
            }}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ProductList() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductListContent />
    </Suspense>
  )
} 