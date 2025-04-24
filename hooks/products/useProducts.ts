import { useMutation, useQueryClient } from 'react-query'
import { Product } from '@/types/types'
import {
    createProductService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
    getProductsService,
    type ApiResponse,
    type DeleteApiResponse,
} from '@/services/products'



// --- Parámetros para la función de obtener productos --- //
export const useProducts = () => {
  // --- Query Client ---
  const queryClient = useQueryClient();

  // --- Crear producto ---
  const createProduct = useMutation<ApiResponse, Error, any>({
    mutationFn: createProductService,
    onError: (error: Error) => {
      console.error('Error creating product:', error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries('products');
    }
  });

  // --- Actualizar producto ---
  const updateProduct = useMutation<ApiResponse, Error, { productId: string; productData: any }>({
    mutationFn: updateProductService,
    onSuccess: (data, variables) => {
      console.log("Product updated successfully:", variables.productId, data);
      queryClient.invalidateQueries(['product', variables.productId]);
      queryClient.invalidateQueries('products');
    },
    onError: (error: Error, variables) => {
      console.error('Error updating product:', variables.productId, error);
    },
  });

  // --- Eliminar producto ---
  const deleteProduct = useMutation<DeleteApiResponse, Error, string>({
    mutationFn: deleteProductService,
    onSuccess: (data, productId) => {
      console.log("Product deleted successfully (hook):", productId, data);
      queryClient.invalidateQueries('products');
    },
    onError: (error: Error, productId) => {
      console.error('Error deleting product (hook):', productId, error);
    },
  });

  // --- Obtener producto por ID ---  
  const getProductById = getProductByIdService;

  // --- Obtener productos ---
  const getProducts = getProductsService;

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProducts,
  };
}; 