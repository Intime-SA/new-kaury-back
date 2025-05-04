// services/clients.ts
import type { Client, GetClientsParams, PaginatedApiResponse } from '@/types/types.tsx'; 
import type { ClientFiltersState } from '@/store/slices/clientFiltersSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Combinar Params de Paginación y Filtros ---
// Usamos la interfaz GetClientsParams (que solo tiene page) y la extendemos con los filtros
// No necesita campos adicionales explícitos aquí si ya están en ClientFiltersState
interface GetClientsServiceParams extends GetClientsParams, Partial<ClientFiltersState> {}

// --- Servicio para Obtener Lista de Clientes (Paginado y Filtrado) ---
export const getClientsService = async (params: GetClientsServiceParams): Promise<PaginatedApiResponse<Client>> => {
    const {
        page = 1,
        searchTerm, 
        registrationDateFrom,
        registrationDateTo,
        email,
        province
    } = params;

    const queryParams = new URLSearchParams({
        page: page.toString(),
    });

    // --- Añadir filtros a los queryParams si existen ---
    if (searchTerm) queryParams.set('search', searchTerm); 
    if (registrationDateFrom) queryParams.set('registrationDateFrom', registrationDateFrom);
    if (registrationDateTo) queryParams.set('registrationDateTo', registrationDateTo);
    if (email) queryParams.set('email', email);
    if (province) queryParams.set('province', province);

    console.log(`Fetching clients (service) with params: ${queryParams.toString()}`);
    const response = await fetch(`${API_BASE_URL}/clients?${queryParams.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error fetching clients: ${response.statusText}`);
    }
    // Parsear la respuesta JSON completa
    const apiResponse = await response.json(); 

    // --- AJUSTE SEGÚN LA ESTRUCTURA REAL --- 

    // 1. Validación de la estructura recibida
    // Esperamos un array 'data' y un objeto 'pagination' en el nivel raíz
    if (!Array.isArray(apiResponse.data) || typeof apiResponse.pagination !== 'object' || apiResponse.pagination === null) {
        console.error("Client API response structure error. Expected { data: [], pagination: {} }", apiResponse);
        throw new Error('Client API response structure is not as expected (root data array and pagination object)'); 
    }

    // 2. Acceso a los datos y paginación
    const responseData = apiResponse.data as Client[]; // El array de clientes
    const paginationFromApi = apiResponse.pagination as { currentPage: number; pageSize: number; totalItems: number; totalPages: number; [key: string]: any }; // Tipado básico

    // 3. Calcular hasNextPage
    const currentPage = paginationFromApi.currentPage; // Usar currentPage de la API
    const totalPages = paginationFromApi.totalPages;
    const hasNextPage = currentPage < totalPages;

    // 4. Construir el objeto PaginatedApiResponse<Client> que espera el hook
    return {
        data: responseData, // El array de clientes está en apiResponse.data
        pagination: {
            currentPage: currentPage, 
            totalPages: totalPages,
            limit: paginationFromApi.pageSize, // Mapear pageSize a limit
            totalCount: paginationFromApi.totalItems, // Mapear totalItems a totalCount
            hasNextPage: hasNextPage, // Usar el valor calculado
        }
    } as PaginatedApiResponse<Client>; 
}; 
