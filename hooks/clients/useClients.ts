import { useInfiniteQuery, UseInfiniteQueryResult } from 'react-query';
import { useSelector } from 'react-redux';
import type { Client, GetClientsParams, PaginatedApiResponse } from '@/types/types.tsx';
import { getClientsService } from '@/services/clients';
import { selectClientFilters } from '@/store/slices/clientFiltersSlice';

// Interfaz para el valor de retorno del hook (opcional pero recomendado)
interface UseClientsReturn {
    clients: Client[];
    fetchNextPage: (options?: any) => Promise<UseInfiniteQueryResult<PaginatedApiResponse<Client>, Error>>;
    hasNextPage?: boolean;
    isLoading: boolean;
    isFetching: boolean;
    isFetchingNextPage: boolean;
    status: 'idle' | 'error' | 'loading' | 'success';
    error: Error | null;
    // Podrías añadir mutaciones aquí si las implementas en el futuro
}

export const useClients = (): UseClientsReturn => {
    // Obtener los filtros actuales del store de Redux
    const filters = useSelector(selectClientFilters);
    
    // --- Función de Fetch para useInfiniteQuery ---
    const fetchClients = async ({ pageParam = 1 }): Promise<PaginatedApiResponse<Client>> => {
        // Combinar página actual con los filtros de Redux
        const params = {
            page: pageParam,
            ...filters, // Pasar los filtros al servicio
        };
        return getClientsService(params);
    };

    // --- Hook useInfiniteQuery ---
    const {
        data: infiniteClientData,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        isLoading,
        status,
        error,
    } = useInfiniteQuery<PaginatedApiResponse<Client>, Error>(
        ['clients', filters], // <-- Incluir filtros en el queryKey
        fetchClients,
        {
            getNextPageParam: (lastPage, allPages) => {
                // Usa la info de paginación devuelta por getClientsService
                return lastPage.pagination?.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined;
            },
            refetchOnWindowFocus: false, // Opcional: ajustar según necesidad
        }
    );

    // Aplanar los datos de las páginas en un solo array
    const clients = infiniteClientData?.pages.flatMap(page => page.data) ?? [];

    // Retornar los datos y funciones necesarios para la UI
    return {
        clients,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetching,
        isFetchingNextPage,
        status,
        error,
    };
}; 