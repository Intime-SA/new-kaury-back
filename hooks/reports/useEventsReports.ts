import { useQuery, UseQueryResult } from 'react-query';
import { useState, useMemo } from 'react';
import {
    getEventsReportsService,
    type EventsData,
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

// Helper para formatear fecha a ISO string SIN conversión de zona horaria
// Usa el día/mes/año LOCAL para evitar que el día cambie por diferencia horaria
const formatToLocalISO = (date: Date, isEndOfDay: boolean = false): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Para startDate: inicio del día (00:00:00.000Z)
    // Para endDate: fin del día (23:59:59.999Z)
    const time = isEndOfDay ? '23:59:59.999Z' : '00:00:00.000Z';

    return `${year}-${month}-${day}T${time}`;
};

export interface UseEventsReportsFilters {
    startDate: Date;
    endDate: Date;
}

export interface UseEventsReportsReturn {
    // Data
    data: EventsData | undefined;
    // Estado de la query
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    status: 'idle' | 'error' | 'loading' | 'success';
    // Refetch manual
    refetch: () => void;
}

export const useEventsReports = (filters: UseEventsReportsFilters): UseEventsReportsReturn => {
    // Parámetros formateados para la API (ISO con día local, sin conversión UTC)
    const queryParams: GetReportsParams = useMemo(() => ({
        startDate: formatToLocalISO(filters.startDate, false),  // 00:00:00.000Z
        endDate: formatToLocalISO(filters.endDate, true),       // 23:59:59.999Z
    }), [filters.startDate, filters.endDate]);

    // Query para obtener los reportes de eventos
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        status,
        refetch,
    } = useQuery<EventsData, Error>(
        ['events-reports', queryParams.startDate, queryParams.endDate],
        () => getEventsReportsService(queryParams),
        {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutos
            cacheTime: 10 * 60 * 1000, // 10 minutos
        }
    );

    return {
        // Data
        data,
        // Estado de la query
        isLoading,
        isFetching,
        isError,
        error: error ?? null,
        status,
        // Refetch manual
        refetch,
    };
};