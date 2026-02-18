// Types para la respuesta de la API de reportes
export interface ReportDataPoint {
    x: string; // Fecha en formato ISO (YYYY-MM-DD)
    y: number; // Valor numérico
}

export interface ReportsData {
    totalOrders: ReportDataPoint[];
    totalSales: ReportDataPoint[];
    totalCancel: ReportDataPoint[];
    totalAmount: ReportDataPoint[];
}

export interface EventsData {
    visitsCount: ReportDataPoint[];
    visitsValue: ReportDataPoint[];
    viewProductCount: ReportDataPoint[];
    viewProductValue: ReportDataPoint[];
    addToCartCount: ReportDataPoint[];
    addToCartValue: ReportDataPoint[];
    createOrderCount: ReportDataPoint[];
    createOrderValue: ReportDataPoint[];
    purchaseCount: ReportDataPoint[];
    purchaseValue: ReportDataPoint[];
    totalEvents: ReportDataPoint[];
    conversionRate: ReportDataPoint[];
}

export interface ReportsApiResponse {
    data: ReportsData;
    status: number;
}

export interface EventsApiResponse {
    data: EventsData;
    status: number;
}

export interface GetReportsParams {
    startDate: string; // ISO date string
    endDate: string;   // ISO date string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Servicio para Obtener Reportes ---
export const getReportsService = async (params: GetReportsParams): Promise<ReportsData> => {
    const { startDate, endDate } = params;

    const queryParams = new URLSearchParams({
        startDate,
        endDate,
    });

    console.log(`Fetching reports (service) with params: ${queryParams.toString()}`);
    
    const response = await fetch(`${API_BASE_URL}/reports?${queryParams.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error fetching reports: ${response.statusText}`);
    }

    const result: ReportsApiResponse = await response.json();

    if (result.status !== 200 || !result.data) {
        throw new Error('API response structure is not as expected');
    }

    return result.data;
};

// --- Servicio para Obtener Reportes de Eventos ---
export const getEventsReportsService = async (params: GetReportsParams): Promise<EventsData> => {
    const { startDate, endDate } = params;

    const queryParams = new URLSearchParams({
        startDate,
        endDate,
    });

    console.log(`Fetching events reports (service) with params: ${queryParams.toString()}`);

    const response = await fetch(`${API_BASE_URL}/reports/events?${queryParams.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error fetching events reports: ${response.statusText}`);
    }

    const result: EventsApiResponse = await response.json();

    if (result.status !== 200 || !result.data) {
        throw new Error('API response structure is not as expected');
    }

    return result.data;
};
