import { useMutation } from 'react-query'
import { ProductFormState } from '@/store/slices/productsSlice'

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

export const useProducts = () => {
  const createProduct = useMutation({
    mutationFn: createProductRequest,
    onError: (error: Error) => {
      console.error('Error creating product:', error);
    },
  });

  return {
    createProduct,
  };
}; 