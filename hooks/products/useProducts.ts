import { useMutation, useQueryClient, useInfiniteQuery, UseInfiniteQueryResult, UseMutationResult } from 'react-query'
import { useSelector } from 'react-redux'
import type { Product, PaginatedApiResponse, GetProductsParams } from '@/types/types'
import {
    createProductService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
    getProductsService,
    type ApiResponse,
    type DeleteApiResponse,
} from '@/services/products'
import { selectProductFilters, ProductFiltersState } from '@/store/slices/productFiltersSlice';

// Definir explícitamente la interfaz de lo que retorna el hook
interface UseProductsReturn {
  // Mutaciones
  createProduct: UseMutationResult<any, Error, any>;
  updateProduct: UseMutationResult<any, Error, { productId: string; productData: any }>;
  deleteProduct: UseMutationResult<DeleteApiResponse, Error, string>;
  // Fetch de un solo producto
  getProductById: (productId: string) => Promise<Product | null>;
  // Resultados y controles de Infinite Query
  products: Product[];           
  fetchNextPage: (options?: any) => Promise<UseInfiniteQueryResult<PaginatedApiResponse, Error>>;
  hasNextPage?: boolean;       
  isLoading: boolean;          
  isFetching: boolean;         
  isFetchingNextPage: boolean; 
  status: 'idle' | 'error' | 'loading' | 'success';            
  error: Error | null;
}

// --- Parámetros para la función de obtener productos --- //
export const useProducts = (): UseProductsReturn => {
  // --- Query Client ---
  const queryClient = useQueryClient();
  const filters = useSelector(selectProductFilters);

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

  // --- Función de Fetch para useInfiniteQuery ---
  const fetchProducts = async ({ pageParam = 1 }): Promise<PaginatedApiResponse> => {
    // Definir params aquí dentro usando los filtros y pageParam
    const params: GetProductsParams = {
      page: pageParam,
      ...filters,
    };
    console.log("Fetching products with params (hook - no limit):");
    return getProductsService(params); // Llamar al servicio (sin limit explícito)
  };

  // --- Hook useInfiniteQuery ---
  const {
    data: infiniteProductsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    status,
    error,
  } = useInfiniteQuery<PaginatedApiResponse, Error>(
    ['products', filters],
    fetchProducts,
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.pagination?.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined;
      },
      refetchOnWindowFocus: false,
    }
  );

  // Aplanar los datos
  const products = infiniteProductsData?.pages.flatMap(page => page.data) ?? [];

  // Retornar explícitamente el objeto que coincide con UseProductsReturn
  return {
    // Mutaciones
    createProduct,
    updateProduct,
    deleteProduct,
    // Fetch de un solo producto
    getProductById,
    // Resultados y controles de Infinite Query
    products,           
    fetchNextPage,      
    hasNextPage,        
    isLoading,          
    isFetching,         
    isFetchingNextPage, 
    status,             
    error,             
  };
}; 