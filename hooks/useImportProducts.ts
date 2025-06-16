import { useMutation } from "react-query";
import { importProducts, ImportProduct, ImportProductsResponse } from '@/services/productsImportService';

export function useImportProducts() {
  return useMutation<ImportProductsResponse, Error, ImportProduct[]>({
    mutationFn: importProducts,
  });
} 