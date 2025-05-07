import { useQuery, UseQueryResult } from 'react-query';
import type { Color } from '@/components/products/views/selected-color'; // Ajusta la ruta
import { getColorsService } from '@/services/colors'; // Ajusta la ruta

interface UseColorsReturn {
    colors: Color[] | undefined;
    isLoading: boolean;
    error: Error | null;
    // Puedes añadir más info si la query lo devuelve (isFetching, status, etc.)
}

export const useColors = (): UseColorsReturn => {
    const {
        data: colors,
        isLoading,
        error,
        // ... otros estados de useQuery si los necesitas
    } = useQuery<Color[], Error>(
        'colors', // Query key
        getColorsService, // Función de fetch
        {
            staleTime: 1000 * 60 * 5, // Cachear por 5 minutos, los colores no cambian tan seguido
            refetchOnWindowFocus: false,
            // Puedes añadir más opciones de react-query aquí
        }
    );

    return {
        colors,
        isLoading,
        error: error as Error | null, // Asegurar que error sea del tipo correcto
    };
}; 