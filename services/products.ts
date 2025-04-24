import type { Product, ProductImage, ProductVariant, ProductCategory } from '@/types/types';
import type { ProductFormState } from '@/store/slices/productsSlice';

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

export interface ProductsPage { // Para Get List (Infinite Query) - Exportar para usar en hook/componente
    products: Product[];
    pagination: { total: number; page: number; limit: number; totalPages: number; };
}

export interface GetProductsParams { // Parámetros para Get List - Exportar para usar en hook/componente
    pageParam?: number;
    limit?: number;
    category?: string | null;
    search?: string | null;
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
    if (!response.ok) throw new Error(data.message || 'Error al crear el producto');
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
    if (!response.ok) throw new Error(data.message || `Error updating product ${productId}`);
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

// --- Servicio para Obtener Lista de Productos (Paginado) ---
export const getProductsService = async ({
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

    console.log(`Fetching products (service): page=${pageParam}`);
    const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error fetching products: ${response.statusText}`);
    }
    const data = await response.json();
    // Ajusta según estructura API:
    // Si devuelve { status: '...', data: ProductsPage }:
    if (data.status !== 'success' || !data.data) {
       throw new Error('Failed to get successful product data from API');
    }
    return data.data as ProductsPage;
    // Si devuelve directamente ProductsPage:
    // return data as ProductsPage;
}; 