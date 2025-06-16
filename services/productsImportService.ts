

export interface ImportProduct {
  id_articulo: number | string;
  preciolista: number | string;
  id_Lista: number | string;
  stock: number | string;
}

export interface ImportProductDetail {
  id_articulo: number | string;
  status: 'success' | 'error';
  message: string;
}

export interface ImportProductsResponse {
  success: boolean;
  summary: {
    totalProcessed: number;
    totalUpdated: number;
    totalErrors: number;
  };
  details: ImportProductDetail[];
}
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function importProducts(productos: ImportProduct[]): Promise<ImportProductsResponse> {
  const response = await fetch(`${API_URL}/products/import`, {
    method: 'POST',
    body: JSON.stringify(productos),
  });
  return response.json();
} 