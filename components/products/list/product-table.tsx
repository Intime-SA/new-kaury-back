"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import type { Product, ProductVariant, ProductCategory } from "@/types/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  isDeleting: boolean
  isFetchingNextPage: boolean
  loadMoreRef: React.Ref<HTMLDivElement>
  onDeleteProduct: (productId: string) => void // Función para manejar la eliminación
  hasNextPage?: boolean // Para mostrar mensaje de fin
}

export function ProductTable({
  products,
  isLoading,
  isDeleting,
  isFetchingNextPage,
  loadMoreRef,
  onDeleteProduct,
  hasNextPage,
}: ProductTableProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const toggleExpand = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return "N/A"
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleConfirmDelete = (productId: string) => {
    console.log("Confirmado eliminar desde tabla:", productId)
    onDeleteProduct(productId) // Llamar a la función pasada por props
  }

  // Si está cargando inicialmente, mostrar esqueletos
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[100px]">Imagen</TableHead>
            <TableHead className="w-[100px]">Nombre</TableHead>
            <TableHead className="w-[120px]">Precio</TableHead>
            <TableHead className="w-[180px]">Categoría</TableHead>
            <TableHead className="w-[80px]">Visible</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={`skel-${index}`} className="transition-colors hover:bg-muted/50">
              <TableCell className="w-[40px]">
                <div className="p-1 rounded">
                  <Skeleton className="h-4 w-4" />
                </div>
              </TableCell>
              <TableCell className="w-[100px]">
                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                  <Skeleton className="absolute inset-0" />
                </div>
              </TableCell>
              <TableCell className="w-[100px] font-medium">
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell className="w-[120px]">
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell className="w-[180px]">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-[80px] rounded-full" />
                  <Skeleton className="h-5 w-[60px] rounded-full" />
                </div>
              </TableCell>
              <TableCell className="w-[80px]">
                <Skeleton className="h-4 w-4 rounded-full" />
              </TableCell>
              <TableCell className="w-[100px]">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[100px]">Imagen</TableHead>
            <TableHead className="w-[100px]">Nombre</TableHead>
            <TableHead className="w-[120px]">Precio</TableHead>
            <TableHead className="w-[180px]">Categoría</TableHead>
            <TableHead className="w-[80px]">Visible</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isExpanded = expandedProducts.has(product.id)
            const hasVariants = product.variants && product.variants.length > 1
            const mainVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null

            return (
              <React.Fragment key={product.id}>
                <TableRow className={cn("transition-colors hover:bg-muted/50", isExpanded && "bg-muted/50")}>
                  <TableCell className="w-[40px]">
                    {hasVariants && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(product.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={
                          product.images && product.images[0]?.src ? product.images[0].src : "/placeholderkaury2.png"
                        }
                        alt={product.name?.es || "Imagen producto"}
                        fill
                        className="object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = "/placeholderkaury2.png"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="w-[100px] font-medium">
                    <div className="truncate max-w-[100px]" title={product.name?.es || "Sin nombre"}>
                      {product.name?.es || "Sin nombre"}
                    </div>
                  </TableCell>
                  <TableCell className="w-[120px]">{formatPrice(mainVariant?.unit_price)}</TableCell>
                  <TableCell className="w-[180px]">
                    {product.categories?.map((category: ProductCategory) => (
                      <Badge key={category.id} variant="secondary" className="mr-1">
                        {category.name?.es}{" "}
                        {category.subcategories?.[0]?.name?.es ? `/ ${category.subcategories[0].name.es}` : ""}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="w-[80px]">
                    {product.showInStore ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <div className="flex items-center gap-1">
                      <Link href={`/products/edit/${product.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el producto
                              <span className="font-medium"> "{product.name?.es}"</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleConfirmDelete(product.id)}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded &&
                  product.variants?.map((variant: ProductVariant) => (
                    <TableRow key={variant.id} className="bg-muted/25 hover:bg-muted/40">
                      <TableCell></TableCell> {/* Columna vacía para el botón de expandir */}
                      <TableCell>
                        <div className="relative w-12 h-12 rounded-md overflow-hidden ml-4">
                          {" "}
                          {/* Añadido margen */}
                          <Image
                            src={
                              variant.imageId
                                ? product.images?.find((img) => img.id.toString() === variant.imageId)?.src ||
                                  "/placeholderkaury2.png"
                                : mainVariant && product.images && product.images[0]?.src
                                  ? product.images[0].src
                                  : "/placeholderkaury2.png"
                            }
                            alt={variant.value || "Imagen variante"}
                            fill
                            className="object-cover"
                            onError={(event) => {
                              event.currentTarget.onerror = null
                              event.currentTarget.src = "/placeholderkaury2.png"
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="pl-8">
                        {" "}
                        {/* Añadido padding */}
                        <div className="text-sm">
                          <p className="font-medium">
                            {variant.attr &&
                              Object.entries(variant.attr)
                                .filter(([_, value]) => value) // Filtrar valores nulos o undefined
                                .map(([key, value], index, array) => (
                                  <span key={key}>
                                    {value}
                                    {index < array.length - 1 ? " / " : ""}
                                  </span>
                                ))}
                          </p>
                          {variant.sku && <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatPrice(variant.unit_price)}{" "}
                        {variant.promotionalPrice && (
                          <span className="text-xs text-green-600 ml-1">
                            (Promo: {formatPrice(variant.promotionalPrice)})
                          </span>
                        )}
                      </TableCell>
                      <TableCell></TableCell> {/* Categoría ya está en la fila principal */}
                      <TableCell></TableCell> {/* Visibilidad ya está en la fila principal */}
                      <TableCell></TableCell> {/* Acciones ya están en la fila principal */}
                    </TableRow>
                  ))}
              </React.Fragment>
            )
          })}
          {/* Esqueletos para carga de siguientes páginas */}
          {isFetchingNextPage &&
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={`fetch-skel-${index}`} className="transition-colors hover:bg-muted/50">
                <TableCell className="w-[40px]">
                  <div className="p-1 rounded">
                    <Skeleton className="h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell className="w-[100px]">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <Skeleton className="absolute inset-0" />
                  </div>
                </TableCell>
                <TableCell className="w-[100px] font-medium">
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell className="w-[120px]">
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell className="w-[180px]">
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-[80px] rounded-full" />
                    <Skeleton className="h-5 w-[60px] rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="w-[80px]">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </TableCell>
                <TableCell className="w-[100px]">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Elemento para detectar scroll y cargar más */}
      <div ref={loadMoreRef} style={{ height: "1px" }} />

      {/* Mensajes de estado al final de la tabla */}
      <div className="text-center mt-4 mb-4 text-sm text-muted-foreground">
        {isFetchingNextPage ? "Cargando más productos..." : ""}
        {!isFetchingNextPage && !hasNextPage && products.length > 0 && "Has llegado al final."}
        {!isLoading && !isFetchingNextPage && products.length === 0 && "No se encontraron productos."}
      </div>
    </>
  )
}
