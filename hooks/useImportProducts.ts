import { useMutation, useQuery } from "react-query";
import { importProducts, ImportProduct, ImportProductsResponse } from '@/services/productsImportService';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Función para iniciar importación en batches
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
    throw new Error(error.message || 'Error al iniciar la importación');
  }

  return response.json();
};

// Función para consultar el estado del job
const getBatchStatus = async (jobId: string) => {
  const response = await fetch(`${API_URL}/products/import-batch/status?jobId=${jobId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al consultar el estado');
  }

  return response.json();
};

export function useImportProducts() {
  return useMutation<any, Error, ImportProduct[]>({
    mutationFn: startBatchImport,
  });
}

// Hook para consultar el estado del batch
export function useBatchStatus(jobId: string | null) {
  return useQuery(
    ['batchStatus', jobId],
    () => getBatchStatus(jobId!),
    {
      enabled: !!jobId,
      refetchInterval: (data) => {
        // Si el job está completado o falló, dejar de hacer polling
        if (data?.job?.status === 'completed' || data?.job?.status === 'failed') {
          return false;
        }
        // Hacer polling cada 2 segundos mientras está procesando
        return 2000;
      },
      refetchIntervalInBackground: false,
    }
  );
} 