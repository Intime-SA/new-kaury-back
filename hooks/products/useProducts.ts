import { useMutation, useQuery } from 'react-query'
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

export const useProducts = () => {
  const createProduct = useMutation({
    mutationFn: createProductRequest,
    onError: (error: Error) => {
      console.error('Error creating product:', error);
    },
  });

  const updateProduct = useMutation({
    mutationFn: updateProductMutationFn,
    onSuccess: (data, variables) => {
      console.log("Product updated successfully (mutation hook):", variables.productId, data);
    },
    onError: (error: Error, variables) => {
      console.error('Error updating product (mutation hook):', variables.productId, error);
    },
  });

  const getProductById = getProductByIdRequest;

  return {
    createProduct,
    updateProduct,
    getProductById,
  };
}; 