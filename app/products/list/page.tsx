"use client"

import React, { Suspense, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'
import { Product } from '@/types/types'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from 'react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { useInView } from 'react-intersection-observer'
import { useProducts } from '@/hooks/products/useProducts'
import { toast } from "@/components/ui/use-toast"
import { ProductTable } from '@/components/products/list/product-table'

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

  const handleDelete = (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
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
    return <div className="container mx-auto py-6 max-w-7xl text-destructive">Error al cargar los productos: {(error as Error).message}</div>
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
        <ProductTable
          products={products}
          isLoading={isLoading}
          isDeleting={deleteProduct.isLoading}
          isFetchingNextPage={isFetchingNextPage}
          loadMoreRef={loadMoreRef}
          onDeleteProduct={handleDelete}
          hasNextPage={hasNextPage}
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
      <Skeleton className="h-[400px] w-full rounded-md border" />
    </div>
  );
} 