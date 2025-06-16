"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { useProducts } from "@/hooks/products/useProducts";
import { toast } from "@/components/ui/use-toast";
import { ProductTable } from "@/components/products/list/product-table";
import { Product } from "@/types/types";
import { ProductFilters } from "@/components/products/list/product-filters";
import { Plus } from "lucide-react";
import * as XLSX from "xlsx";
import { ImportProductsSection } from "@/components/products/ImportProductsSection";
import { useImportProducts } from "@/hooks/useImportProducts";

function ProductListContent() {
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

  const {
    products,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    status,
    error,
    deleteProduct,
  } = useProducts();

  const importProductsMutation = useImportProducts();

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
        toast({
          title: "Éxito",
          description: `Producto "${
            productToDelete?.name.es || productId
          }" eliminado.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: `No se pudo eliminar el producto: ${
            error?.message || "Error desconocido"
          }`,
          variant: "destructive",
        });
      },
    });
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rowsReadyCount, setRowsReadyCount] = useState<number>(0);
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([]);

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Filtrar solo los que tengan id_Lista == 2
    const productos = json
      .slice(1)
      .filter((row: any) => row[6] == 2)
      .map((row: any) => ({
        id_articulo: row[0],
        preciolista: row[5],
        id_Lista: row[6],
        stock: row[11],
      }));

    setProductosFiltrados(productos);
    setRowsReadyCount(productos.length);
  };

  const handleConfirm = () => {
    if (productosFiltrados.length === 0) return;
    importProductsMutation.mutate(productosFiltrados, {
      onSuccess: (data) => {
        toast({
          title: "Importación exitosa",
          description: `Procesados: ${data.summary.totalProcessed}, Actualizados: ${data.summary.totalUpdated}, Errores: ${data.summary.totalErrors}`,
        });
        setSelectedFile(null);
        setRowsReadyCount(0);
        setProductosFiltrados([]);
      },
      onError: (error: any) => {
        toast({
          title: "Error al importar",
          description: error?.message || "Ocurrió un error inesperado",
          variant: "destructive",
        });
      },
    });
  };

  const handleClear = () => {
    setSelectedFile(null);
    setRowsReadyCount(0);
    setProductosFiltrados([]);
  };

  if (status === "error") {
    return (
      <div className="container mx-auto py-6 max-w-7xl text-destructive">
        Error al cargar los productos:{" "}
        {(error as Error)?.message || "Error desconocido"}
      </div>
    );
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

      {/* Importar productos desde Excel */}
      <div className="mb-6">
        <ImportProductsSection
          onFileSelected={handleFileSelected}
          onConfirm={handleConfirm}
          onClear={handleClear}
          selectedFile={selectedFile}
          rowsReadyCount={rowsReadyCount}
        />
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
  );
}

export default function ProductList() {
  return (
    <Suspense fallback={<ProductListPageSkeleton />}>
      <ProductListContent />
    </Suspense>
  );
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
