import { useMutation, useQuery } from "react-query";
import { importProducts, ImportProduct, ImportProductsResponse } from '@/services/productsImportService';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Función para iniciar importación en batches (crear job)
const startBatchImport = async (products: ImportProduct[]) => {
  const response = await fetch(`${API_URL}/products/import-batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(products),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear el job de importación');
  }

  return response.json();
};

// Función para procesar un chunk específico
const processBatchChunk = async ({ jobId, batchNumber }: { jobId: string; batchNumber: number }) => {
  const response = await fetch(`${API_URL}/products/import-batch/process-chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId, batchNumber }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al procesar el batch');
  }

  return response.json();
};

// Función para consultar el progreso del job
const getBatchProgress = async (jobId: string) => {
  const response = await fetch(`${API_URL}/products/import-batch/status?jobId=${jobId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al consultar el progreso');
  }

  return response.json();
};

export function useImportProducts() {
  return useMutation<any, Error, ImportProduct[]>({
    mutationFn: startBatchImport,
  });
}

// Hook para procesar un chunk específico
export function useProcessBatchChunk() {
  return useMutation<any, Error, { jobId: string; batchNumber: number }>({
    mutationFn: processBatchChunk,
  });
}

// Hook para consultar el progreso del batch
export function useBatchProgress(jobId: string | null) {
  return useQuery(
    ['batchProgress', jobId],
    () => getBatchProgress(jobId!),
    {
      enabled: !!jobId,
      refetchInterval: (data) => {
        // Si el job está completado o falló, dejar de hacer polling
        if (data?.job?.status === 'completed' || data?.job?.status === 'failed') {
          return false;
        }
        // Hacer polling cada 5 segundos mientras está procesando
        return 5000;
      },
      refetchIntervalInBackground: false,
    }
  );
} 