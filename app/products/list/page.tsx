"use client"

import React, { Suspense, useEffect, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from 'next/image'
import Link from 'next/link'
import { Product, ProductImage, ProductVariant, ProductCategory } from '@/types/types'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from 'react-query'
import { ProductRowSkeleton } from '@/components/products/list/product-row-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { useInView } from 'react-intersection-observer'
import { useProducts } from '@/hooks/products/useProducts'
import { toast } from "@/components/ui/use-toast"
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

interface ProductsPage {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function ProductListContent() {
  const searchParams = useSearchParams()
  const [expandedProducts, setExpandedProducts] = React.useState<Set<string>>(new Set())

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

  const { deleteProduct, getProducts } = useProducts();

  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<ProductsPage, Error>(
    ['products', limit, category, search],
    ({ pageParam = 1 }) => getProducts({ pageParam, limit, category, search }),
    {
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = lastPage.pagination.page;
        const totalPages = lastPage.pagination.totalPages;
        console.log(`Current: ${currentPage}, Total: ${totalPages}`);
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
    }
  )

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Intersection observer inView: Cargando siguiente página...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap(page => page.products) ?? [];

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

  const handleDelete = (product: Product) => {
    console.log("Confirmado eliminar:", product.id, product.name.es);
    deleteProduct.mutate(product.id, {
      onSuccess: () => {
        toast({ title: "Éxito", description: `Producto "${product.name.es}" eliminado.` });
      },
      onError: (error: Error) => {
        toast({ title: "Error", description: `No se pudo eliminar el producto: ${error.message}`, variant: "destructive" });
      }
    });
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
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
             {Array.from({ length: limit }).map((_, index) => (
               <ProductRowSkeleton key={`skel-${index}`} />
             ))}
           </TableBody>
         </Table>
      </div>
    );
  }

  if (status === 'error') {
    return <div>Error al cargar los productos: {(error as Error).message}</div>
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
            {products.map((product) => {
              const isExpanded = expandedProducts.has(product.id);
              const hasVariants = product.variants.length > 1;
              
              return (
                <React.Fragment key={product.id}>
                   <TableRow className={cn(
                     "transition-colors hover:bg-muted/50",
                     isExpanded && "bg-muted/50"
                   )}>
                      <TableCell>
                       {hasVariants && (
                         <button type="button" onClick={() => toggleExpand(product.id)} className="p-1 hover:bg-muted rounded">
                           {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                         </button>
                       )}
                     </TableCell>
                     <TableCell>
                       {product.images[0] && (
                         <div className="relative w-16 h-16 rounded-md overflow-hidden">
                           <Image src={product.images[0].src} alt={product.name.es} fill className="object-cover" />
                         </div>
                       )}
                     </TableCell>
                     <TableCell className="font-medium">{product.name.es}</TableCell>
                     <TableCell>{formatPrice(product.variants[0]?.unit_price || 0)}</TableCell>
                     <TableCell>
                       {product.categories.map((category: ProductCategory) => (
                         <Badge key={category.id} variant="secondary" className="mr-1">
                           {category.name.es} {category.subcategories?.[0]?.name?.es ? `/ ${category.subcategories[0].name.es}` : ''}
                         </Badge>
                       ))}
                     </TableCell>
                     <TableCell>
                       {product.published ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <Link href={`/products/edit/${product.id}`}>
                           <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                         </Link>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={deleteProduct.isLoading}><Trash2 className="h-4 w-4" /></Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Esta acción no se puede deshacer. Se eliminará permanentemente el producto
                                 <span className="font-medium"> "{product.name.es}"</span>.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel disabled={deleteProduct.isLoading}>Cancelar</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleDelete(product)} disabled={deleteProduct.isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                 {deleteProduct.isLoading ? "Eliminando..." : "Confirmar Eliminación"}
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </div>
                     </TableCell>
                   </TableRow>
                  {isExpanded && product.variants.map((variant: ProductVariant) => (
                     <TableRow key={variant.id} className="bg-muted/25">
                       <TableCell></TableCell>
                       <TableCell>
                         <div className="relative w-12 h-12 rounded-md overflow-hidden">
                           <Image src={variant.imageId ? product.images.find(img => img.id.toString() === variant.imageId)?.src ?? "/placeholder.svg" : product.images[0]?.src ?? "/placeholder.svg"} alt={variant.value} fill className="object-cover" />
                         </div>
                       </TableCell>
                       <TableCell className="pl-4">
                         <div className="text-sm">
                           <p className="font-medium">{variant.value || "Variante principal"}</p>
                           <p className="text-muted-foreground">SKU: {variant.sku || "No definido"}</p>
                         </div>
                       </TableCell>
                       <TableCell>{formatPrice(variant.unit_price)} {variant.promotionalPrice && `(Promo: ${formatPrice(variant.promotionalPrice)})`}</TableCell>
                       <TableCell></TableCell>
                       <TableCell>{variant.stockManagement ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}</TableCell>
                       <TableCell></TableCell>
                     </TableRow>
                   ))}
                </React.Fragment>
              )
            })}
            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, index) => ( 
                <ProductRowSkeleton key={`fetch-skel-${index}`} />
              ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div ref={loadMoreRef} style={{ height: '50px', marginTop: '20px' }} />

      <div className="text-center mt-4 mb-4 text-muted-foreground">
         {isFetching && !isLoading && hasNextPage ? 'Cargando más productos...' : ''} 
         {!hasNextPage && products.length > 0 && !isFetching ? 'Has llegado al final.' : ''}
         {products.length === 0 && !isLoading && 'No se encontraron productos.'} 
      </div>
    </div>
  )
}

export default function ProductList() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6 max-w-7xl"><Skeleton className="h-12 w-full" /></div>}>
      <ProductListContent />
    </Suspense>
  )
} 