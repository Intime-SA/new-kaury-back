"use client"

import React, { Suspense, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useInView } from 'react-intersection-observer'
import { useProducts } from '@/hooks/products/useProducts'
import { toast } from "@/components/ui/use-toast"
import { ProductTable } from '@/components/products/list/product-table'
import { Product } from '@/types/types'
import { ProductFilters } from '@/components/products/list/product-filters'
import { Plus } from 'lucide-react'

function ProductListContent() {
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

  const {
    products,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    status,
    error,
    deleteProduct
  } = useProducts();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Intersection observer inView: Cargando siguiente página...");
      fetchNextPage?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDelete = (productId: string) => {
    const productToDelete = products?.find((p: Product) => p.id === productId);
    console.log("Initiating delete for product ID:", productId);
    deleteProduct.mutate(productId, {
      onSuccess: () => {
        toast({ title: "Éxito", description: `Producto "${productToDelete?.name.es || productId}" eliminado.` });
      },
      onError: (error: any) => {
        toast({ title: "Error", description: `No se pudo eliminar el producto: ${error?.message || 'Error desconocido'}`, variant: "destructive" });
      }
    });
  };

  if (status === 'error') {
    return <div className="container mx-auto py-6 max-w-7xl text-destructive">Error al cargar los productos: {(error as Error)?.message || 'Error desconocido'}</div>
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/products/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Crear Producto
          </Button>
        </Link>
      </div>

      <ProductFilters />

      <ScrollArea className="rounded-md border">
        <ProductTable
          products={products ?? []}
          isLoading={isLoading ?? true}
          isDeleting={deleteProduct.isLoading}
          isFetchingNextPage={isFetchingNextPage ?? false}
          loadMoreRef={loadMoreRef}
          onDeleteProduct={handleDelete}
          hasNextPage={hasNextPage ?? false}
        />
      </ScrollArea>

    </div>
  )
}

export default function ProductList() {
  return (
    <Suspense fallback={<ProductListPageSkeleton />}>
      <ProductListContent />
    </Suspense>
  )
}

function ProductListPageSkeleton() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[180px] w-full rounded-md border mb-6" />
      <Skeleton className="h-[400px] w-full rounded-md border" />
    </div>
  );
} 