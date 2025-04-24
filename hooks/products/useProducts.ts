import { useMutation, useQuery, useQueryClient } from 'react-query'
import { ProductFormState } from '@/store/slices/productsSlice'
import { Product } from '@/types/types'

interface ApiResponse {
  status: 'success' | 'error';
  data?: {
    id: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  };
  message?: string;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

interface ApiResponseSingleProduct {
  status: 'success' | 'error';
  data?: Product;
  message?: string;
}

interface DeleteApiResponse {
  status: 'success' | 'error';
  message?: string;
}

// --- Interfaz para la página de productos (asegúrate que coincida con tu API) ---
interface ProductsPage {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Parámetros para la función de obtener productos ---
interface GetProductsParams {
  pageParam?: number;
  limit?: number;
  category?: string | null;
  search?: string | null;
}

const createProductRequest = async (productData: ProductFormState): Promise<ApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al crear el producto');
  }

  return data;
};

const getProductByIdRequest = async (productId: string): Promise<Product | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Error fetching product ${productId}: ${response.statusText}`);
  }

  const result: ApiResponseSingleProduct = await response.json();

  if (result.status === 'success' && result.data) {
    return result.data;
  } else {
    console.warn("API returned success status but data might be missing:", result);
    throw new Error(result.message || 'Failed to get product data');
  }
};

const updateProductMutationFn = async ({ productId, productData }: { productId: string; productData: Partial<ProductFormState> }): Promise<ApiResponse> => {
  console.log("Updating product (request function):", productId, productData);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Error updating product ${productId}`);
  }
  return data;
};

const deleteProductRequest = async (productId: string): Promise<DeleteApiResponse> => {
  console.log("Deleting product (request function):", productId);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}`, {
   method: 'DELETE',
   headers: {
     'Content-Type': 'application/json',
   },
 });

 if (response.status === 204) {
   console.log(`Product ${productId} deleted successfully (204 No Content)`);
   return { status: 'success', message: 'Producto eliminado (204)' };
 }

 const data = await response.json().catch(() => null);

 if (!response.ok) {
   throw new Error(data?.message || `Error deleting product ${productId}: ${response.statusText}`);
 }

 return data || { status: 'success', message: 'Producto eliminado' };
}

const getProductsRequest = async ({
  pageParam = 1,
  limit = 10,
  category,
  search,
}: GetProductsParams): Promise<ProductsPage> => {
  const queryParams = new URLSearchParams({
    page: pageParam.toString(),
    limit: limit.toString(),
  });
  if (category) queryParams.set('category', category);
  if (search) queryParams.set('search', search);

  console.log(`Fetching products: page=${pageParam}, limit=${limit}, category=${category}, search=${search}`);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?${queryParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Error fetching products: ${response.statusText}`);
  }

  const data = await response.json();
   // Ajusta esto según la estructura REAL de tu API. 
   // Si devuelve un objeto con { status: '...', data: ProductsPage }:
   if (data.status !== 'success' || !data.data) {
      throw new Error('Failed to get successful product data from API');
   }
  return data.data as ProductsPage; // Devuelve la data correcta
};

export const useProducts = () => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: createProductRequest,
    onError: (error: Error) => {
      console.error('Error creating product:', error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries('products');
    }
  });

  const updateProduct = useMutation({
    mutationFn: updateProductMutationFn,
    onSuccess: (data, variables) => {
      console.log("Product updated successfully:", variables.productId, data);
      queryClient.invalidateQueries(['product', variables.productId]);
      queryClient.invalidateQueries('products');
    },
    onError: (error: Error, variables) => {
      console.error('Error updating product:', variables.productId, error);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: deleteProductRequest,
    onSuccess: (data, productId) => {
      console.log("Product deleted successfully (mutation hook):", productId, data);
      queryClient.invalidateQueries('products');
    },
    onError: (error: Error, productId) => {
     console.error('Error deleting product (mutation hook):', productId, error);
   },
 });

  const getProductById = getProductByIdRequest;

  const getProducts = getProductsRequest;

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProducts,
  };
}; 