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
import { useBatchImportProducts } from "@/hooks/useImportProducts";
import { useAnalyzeImportProducts } from "@/hooks/useAnalyzeImportProducts";
import { ImportAnalyzeModal } from "@/components/products/ImportAnalyzeModal";
import { BatchProgressModal } from "@/components/products/BatchProgressModal";

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

  const {
    startBatchImport,
    progress,
    isImporting,
    allDetails,
    resetProgress,
    error: importError
  } = useBatchImportProducts();
  
  const analyzeImportMutation = useAnalyzeImportProducts();

  // Estado para controlar el modal de progreso
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Intersection observer inView: Cargando siguiente página...");
      fetchNextPage?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Mostrar modal de progreso cuando comience la importación
  useEffect(() => {
    if (isImporting && progress) {
      setShowProgressModal(true);
    }
  }, [isImporting, progress]);

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
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);

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
      }))

    setProductosFiltrados(productos);
    setRowsReadyCount(productos.length);
  };

  const handleAnalyze = () => {
    if (productosFiltrados.length === 0) return;
    analyzeImportMutation.mutate(productosFiltrados, {
      onSuccess: () => setShowAnalyzeModal(true),
      onError: (error: any) => {
        toast({
          title: "Error al analizar",
          description: error?.message || "Ocurrió un error inesperado",
          variant: "destructive",
        });
      },
    });
  };

  const handleConfirm = () => {
    if (!analyzeImportMutation.data?.analysis?.itemsToUpdate?.length) return;

    // Obtener los ids de las variantes a actualizar
    const idsToUpdate = new Set(
      analyzeImportMutation.data.analysis.itemsToUpdate.map(item => Number(item.id_articulo))
    );

    // Filtrar productosFiltrados solo con los que tienen cambios
    const productosAImportar = productosFiltrados.filter(prod =>
      idsToUpdate.has(Number(prod.id_articulo))
    );

    if (productosAImportar.length === 0) {
      toast({
        title: "Nada para actualizar",
        description: "No hay variantes con cambios para importar.",
        variant: "destructive",
      });
      return;
    }

    // Usar el método startBatchImport del hook
    startBatchImport(
      productosAImportar,
      70, // batchSize
      (progressData) => {
        // Callback de progreso - opcional para mostrar progreso en tiempo real
        console.log("Progreso de importación:", progressData);
      },
      (finalProgress, allDetails) => {
        // Callback cuando se completa la importación
        toast({
          title: "Importación completada",
          description: `Procesados: ${finalProgress.totalItems}, Actualizados: ${finalProgress.totalUpdated}, Errores: ${finalProgress.totalErrors}`,
        });
        
        // Limpiar estado
        setSelectedFile(null);
        setRowsReadyCount(0);
        setProductosFiltrados([]);
        setShowAnalyzeModal(false);
        setShowProgressModal(false);
        resetProgress();
      },
      (error) => {
        // Callback de error
        toast({
          title: "Error al importar",
          description: error?.message || "Ocurrió un error inesperado",
          variant: "destructive",
        });
        setShowProgressModal(false);
      }
    );
  };

  const handleClear = () => {
    setSelectedFile(null);
    setRowsReadyCount(0);
    setProductosFiltrados([]);
    resetProgress(); // Limpiar también el progreso del hook
  };

  // Preparar datos para el modal de progreso
  const getProgressModalData = () => {
    if (!progress) return null;

    return {
      job: {
        status: progress.isComplete ? 'completed' : 'processing',
        progress: progress.progressPercentage,
        totalItems: progress.totalItems,
        processedItems: progress.processedItems,
        currentBatch: progress.currentBatch,
        batches: progress.totalBatches,
        results: {
          updated: progress.totalUpdated,
          errors: allDetails.filter(detail => detail.status === 'error').map(detail => detail.message)
        }
      }
    };
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
          onConfirm={handleAnalyze}
          onClear={handleClear}
          selectedFile={selectedFile}
          rowsReadyCount={rowsReadyCount}
          analyzeLoading={analyzeImportMutation.isLoading}
          analyzeData={analyzeImportMutation.data}
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

      <ImportAnalyzeModal
        open={showAnalyzeModal}
        onClose={() => setShowAnalyzeModal(false)}
        onConfirm={handleConfirm}
        analysis={analyzeImportMutation.data?.analysis ?? {
          totalItems: 0,
          itemsToUpdate: [],
          itemsNotFound: [],
          itemsUnchanged: [],
          summary: {
            totalPriceChanges: 0,
            totalStockChanges: 0,
            totalNotFound: 0,
            totalUnchanged: 0,
            totalToUpdate: 0,
          }
        }}
        importLoading={isImporting}
      />

      {/* Modal de progreso de importación */}
      <BatchProgressModal
        open={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        jobId={null}
        jobData={getProgressModalData()}
        isLoading={isImporting}
      />
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
