import { useQuery, UseQueryResult } from 'react-query';
import { useState, useMemo } from 'react';
import {
    getReportsService,
    type ReportsData,
    type GetReportsParams,
} from '@/services/reports';

// Helper para obtener el primer día del mes actual
const getStartOfMonth = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Helper para obtener el último día del mes actual
const getEndOfMonth = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
};

// Helper para formatear fecha a ISO string
const formatToISO = (date: Date): string => {
    return date.toISOString();
};

export interface UseReportsFilters {
    startDate: Date;
    endDate: Date;
}

export interface UseReportsReturn {
    // Data
    data: ReportsData | undefined;
    // Estado de la query
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    status: 'idle' | 'error' | 'loading' | 'success';
    // Filtros y setters
    filters: UseReportsFilters;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
    setDateRange: (startDate: Date, endDate: Date) => void;
    // Refetch manual
    refetch: () => void;
}

export const useReports = (initialFilters?: Partial<UseReportsFilters>): UseReportsReturn => {
    // Estado de filtros con valores por defecto (mes actual)
    const [filters, setFilters] = useState<UseReportsFilters>({
        startDate: initialFilters?.startDate ?? getStartOfMonth(),
        endDate: initialFilters?.endDate ?? getEndOfMonth(),
    });

    // Parámetros formateados para la API
    const queryParams: GetReportsParams = useMemo(() => ({
        startDate: formatToISO(filters.startDate),
        endDate: formatToISO(filters.endDate),
    }), [filters.startDate, filters.endDate]);

    // Query para obtener los reportes
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        status,
        refetch,
    } = useQuery<ReportsData, Error>(
        ['reports', queryParams.startDate, queryParams.endDate],
        () => getReportsService(queryParams),
        {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutos
            cacheTime: 10 * 60 * 1000, // 10 minutos
        }
    );

    // Setters para los filtros
    const setStartDate = (date: Date) => {
        setFilters(prev => ({ ...prev, startDate: date }));
    };

    const setEndDate = (date: Date) => {
        setFilters(prev => ({ ...prev, endDate: date }));
    };

    const setDateRange = (startDate: Date, endDate: Date) => {
        setFilters({ startDate, endDate });
    };

    return {
        // Data
        data,
        // Estado de la query
        isLoading,
        isFetching,
        isError,
        error: error ?? null,
        status,
        // Filtros y setters
        filters,
        setStartDate,
        setEndDate,
        setDateRange,
        // Refetch manual
        refetch,
    };
};
