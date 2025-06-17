import { useMutation } from "react-query";
import { ImportProduct, CurrentProduct, AnalyzeResponse } from '@/services/productsImportService';

export interface AnalyzeImportProductResponse {
  success: boolean;
  analysis: {
    totalItems: number;
    itemsToUpdate: any[];
    itemsNotFound: any[];
    itemsUnchanged: any[];
    summary: {
      totalPriceChanges: number;
      totalStockChanges: number;
      totalNotFound: number;
      totalUnchanged: number;
      totalToUpdate: number;
    };
  };
}

async function fetchCurrentProducts(): Promise<AnalyzeResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${API_URL}/products/analyze-import`, { method: 'GET' });
  return response.json();
}

function analyzeImport(
  productsToImport: ImportProduct[],
  currentProducts: CurrentProduct[]
): AnalyzeImportProductResponse {
  const itemsToUpdate = [];
  const itemsNotFound = [];
  const itemsUnchanged = [];
  let totalPriceChanges = 0;
  let totalStockChanges = 0;

  for (const prod of productsToImport) {
    const found = currentProducts.find(
      v =>
        String(v.id_articulo) === String(prod.id_articulo) &&
        String(v.id_Lista) === String(prod.id_Lista)
    );
    if (!found) {
      itemsNotFound.push({ id_articulo: Number(prod.id_articulo), reason: "No encontrado en la base" });
      continue;
    }
    const priceChange =
      prod.preciolista != null && Number(prod.preciolista) !== Number(found.preciolista)
        ? { from: Number(found.preciolista), to: Number(prod.preciolista) }
        : null;
    const stockChange =
      prod.stock != null && Number(prod.stock) !== Number(found.stock)
        ? { from: Number(found.stock), to: Number(prod.stock) }
        : null;

    if (priceChange || stockChange) {
      itemsToUpdate.push({
        id_articulo: Number(prod.id_articulo),
        productId: "", // Si tienes este dato, agrégalo
        variantId: "",
        changes: { price: priceChange, stock: stockChange }
      });
      if (priceChange) totalPriceChanges++;
      if (stockChange) totalStockChanges++;
    } else {
      itemsUnchanged.push({
        id_articulo: Number(prod.id_articulo),
        currentPrice: Number(found.preciolista),
        currentStock: Number(found.stock)
      });
    }
  }

  return {
    success: true,
    analysis: {
      totalItems: productsToImport.length,
      itemsToUpdate,
      itemsNotFound,
      itemsUnchanged,
      summary: {
        totalPriceChanges,
        totalStockChanges,
        totalNotFound: itemsNotFound.length,
        totalUnchanged: itemsUnchanged.length,
        totalToUpdate: itemsToUpdate.length
      }
    }
  };
}

export function useAnalyzeImportProducts() {
  return useMutation<AnalyzeImportProductResponse, Error, ImportProduct[]>({
    mutationFn: async (productsToImport) => {
      const currentProducts = await fetchCurrentProducts();
      console.log(currentProducts, 'currentProducts');
      console.log(productsToImport, 'productsToImport');
      return analyzeImport(productsToImport, currentProducts.data);
    }
  });
} 