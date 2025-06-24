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
import { useImportProducts, useBatchProgress, useProcessBatchChunk } from "@/hooks/useImportProducts";
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

  const importProductsMutation = useImportProducts();
  const processBatchChunkMutation = useProcessBatchChunk();
  const analyzeImportMutation = useAnalyzeImportProducts();

  // Estados para el sistema de batches
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showBatchProgress, setShowBatchProgress] = useState(false);
  const [currentBatchNumber, setCurrentBatchNumber] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hook para consultar el progreso del batch
  const batchProgressQuery = useBatchProgress(currentJobId);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Intersection observer inView: Cargando siguiente página...");
      fetchNextPage?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Efecto para manejar el estado del batch
  useEffect(() => {
    if (batchProgressQuery.data?.job?.status === 'completed') {
      const job = batchProgressQuery.data.job;
      toast({
        title: "Importación completada",
        description: `Procesados: ${job.results.processed}, Actualizados: ${job.results.updated}, Errores: ${job.results.errors.length}`,
      });
      setShowBatchProgress(false);
      setCurrentJobId(null);
      setIsProcessing(false);
    } else if (batchProgressQuery.data?.job?.status === 'failed') {
      toast({
        title: "Error en la importación",
        description: "La importación falló. Revisa los errores en el modal.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [batchProgressQuery.data]);

  // Función para procesar el siguiente batch
  const processNextBatch = async () => {
    if (!currentJobId || isProcessing) return;

    setIsProcessing(true);
    
    try {
      await processBatchChunkMutation.mutateAsync({ 
        jobId: currentJobId, 
        batchNumber: currentBatchNumber 
      });
      
      setCurrentBatchNumber(prev => prev + 1);
      
      // Si hay más batches, procesar el siguiente después de un pequeño delay
      if (currentBatchNumber + 1 < totalBatches) {
        setTimeout(() => {
          processNextBatch();
        }, 1000); // 1 segundo de delay entre batches
      }
      
    } catch (error: any) {
      toast({
        title: "Error procesando batch",
        description: error?.message || "Error al procesar el batch",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Efecto para iniciar el procesamiento cuando se crea el job
  useEffect(() => {
    if (currentJobId && totalBatches > 0 && !isProcessing) {
      processNextBatch();
    }
  }, [currentJobId, totalBatches]);

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

    // Crear job de importación
    importProductsMutation.mutate(productosAImportar, {
      onSuccess: (data) => {
        setCurrentJobId(data.jobId);
        setTotalBatches(data.summary.batches);
        setCurrentBatchNumber(0);
        setShowBatchProgress(true);
        setShowAnalyzeModal(false);
        
        toast({
          title: "Job creado",
          description: `Job ${data.jobId} creado con ${data.summary.totalItems} items en ${data.summary.batches} batches`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error al crear job",
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
        importLoading={importProductsMutation.isLoading}
      />

      <BatchProgressModal
        open={showBatchProgress}
        onClose={() => {
          setShowBatchProgress(false);
          setCurrentJobId(null);
          setIsProcessing(false);
        }}
        jobId={currentJobId}
        jobData={batchProgressQuery.data}
        isLoading={batchProgressQuery.isLoading}
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
