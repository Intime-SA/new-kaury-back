import type { Product, ProductImage, ProductVariant, ProductCategory } from '@/types/types';
import type { ProductFormState } from '@/store/slices/productsSlice';
import type { ProductFiltersState } from '@/store/slices/productFiltersSlice';

// Interfaces de respuesta de API
export interface ApiResponse { // Para Create/Update
    status: 'success' | 'error';
    data?: { id: string; [key: string]: any; };
    message?: string;
    errors?: Array<{ path: string[]; message: string; }>;
}

interface ApiResponseSingleProduct { // Para Get By ID
    status: 'success' | 'error';
    data?: Product;
    message?: string;
}

export interface DeleteApiResponse { // Para Delete
    status: 'success' | 'error';
    message?: string;
}

export interface PaginatedApiResponse { // Lo renombramos aquí temporalmente
    data: Product[]; // Cambiamos 'products' a 'data' para que coincida con el hook
    pagination: {
        total?: number; // Hacer opcional por si la API no siempre lo devuelve
        currentPage: number; // Cambiar 'page' a 'currentPage'
        limit: number;
        totalPages: number;
        hasNextPage: boolean; // Añadir esto para getNextPageParam
        hasPrevPage?: boolean; // Opcional
     };
}

export interface GetProductsParams extends Partial<ProductFiltersState> { // Hereda los filtros opcionalmente
    page?: number; // Cambiar pageParam a page para consistencia
    limit?: number;
    category?: string | null; // Mantener filtros existentes
    search?: string | null;
    productName?: string | null; // <-- Añadir productName a la desestructuración
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Servicio para Crear Producto ---
export const createProductService = async (productData: ProductFormState): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw data; // Lanzar la respuesta cruda de la API
    return data;
};

// --- Servicio para Obtener Producto por ID ---
export const getProductByIdService = async (productId: string): Promise<Product | null> => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error fetching product ${productId}: ${response.statusText}`);
    }
    const result: ApiResponseSingleProduct = await response.json();
    // Asegúrate que la estructura coincida con ApiResponseSingleProduct
    if (result.status === 'success' && result.data) return result.data;
    // Si la API devuelve directamente el producto en caso de éxito, ajusta aquí:
    // return result as Product; 
    throw new Error(result.message || 'Failed to get product data');
};

// --- Servicio para Actualizar Producto ---
export const updateProductService = async ({ productId, productData }: { productId: string; productData: Partial<ProductFormState> }): Promise<ApiResponse> => {
    console.log("Updating product (service):", productId);
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok) throw data; // Lanzar la respuesta cruda de la API
    return data;
};

// --- Servicio para Eliminar Producto ---
export const deleteProductService = async (productId: string): Promise<DeleteApiResponse> => {
    console.log("Deleting product (service):", productId);
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 204) return { status: 'success', message: 'Producto eliminado (204)' };
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || `Error deleting product ${productId}: ${response.statusText}`);
    return data || { status: 'success', message: 'Producto eliminado' };
};

// --- Servicio para Obtener Lista de Productos (Paginado y Filtrado) ---
export const getProductsService = async (params: GetProductsParams): Promise<PaginatedApiResponse> => {
    const {
        page = 1,
        category,
        minPrice,
        maxPrice,
        inStock,
        createdAtFrom,
        createdAtTo,
        updatedAtFrom,
        updatedAtTo,
        productName
    } = params;

    const queryParams = new URLSearchParams({
        page: page.toString(),
    });

    // Añadir filtros solo si tienen valor
    if (category) queryParams.set('category', category);
    if (productName) queryParams.set('search', productName);
    if (minPrice !== null && minPrice !== undefined) queryParams.set('minPrice', minPrice.toString());
    if (maxPrice !== null && maxPrice !== undefined) queryParams.set('maxPrice', maxPrice.toString());
    if (inStock !== null && inStock !== undefined) queryParams.set('inStock', inStock.toString());
    
    // Ajustar las fechas para incluir la hora
    if (createdAtFrom) {
        const fromDate = new Date(createdAtFrom);
        const formattedDate = fromDate.toISOString().split('T')[0];
        queryParams.set('createdAtFrom', formattedDate);
    }
    if (createdAtTo) {
        const toDate = new Date(createdAtTo);
        const formattedDate = toDate.toISOString().split('T')[0];
        queryParams.set('createdAtTo', formattedDate);
    }
    if (updatedAtFrom) {
        const fromDate = new Date(updatedAtFrom);
        const formattedDate = fromDate.toISOString().split('T')[0];
        queryParams.set('updatedAtFrom', formattedDate);
    }
    if (updatedAtTo) {
        const toDate = new Date(updatedAtTo);
        const formattedDate = toDate.toISOString().split('T')[0];
        queryParams.set('updatedAtTo', formattedDate);
    }

    console.log(`Fetching products (service) with params (no limit from FE): ${queryParams.toString()}`);
    const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error fetching products: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.status !== 'success' || !data.data || !data.data.products || !data.data.pagination) {
       throw new Error('API response structure is not as expected (status/data/products/pagination)'); 
    }
    const responseData = data.data as { products: Product[], pagination: any };
    const paginationFromApi = responseData.pagination;
    const currentPage = paginationFromApi.page;
    const totalPages = paginationFromApi.totalPages;
    const hasNextPage = currentPage < totalPages;

    return {
        data: responseData.products,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            limit: paginationFromApi.limit,
            totalCount: paginationFromApi.total,
            hasNextPage: hasNextPage, 
        }
    } as PaginatedApiResponse;
}; 