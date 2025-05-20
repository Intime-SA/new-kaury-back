// services/colors.ts
import type { Color } from '@/components/products/views/selected-color'; // Ajusta la ruta si es necesario

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ColorsApiResponse {
    data: Color[];
}

export const getColorsService = async (): Promise<Color[]> => {
    const response = await fetch(`${API_BASE_URL}/colors`); // Endpoint de tu API

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error fetching colors: ${response.statusText}`);
    }
    const apiResponse: ColorsApiResponse = await response.json();
    
    if (!apiResponse || !Array.isArray(apiResponse.data)) {
        console.error("Colors API response structure error. Expected { data: Color[] }", apiResponse);
        throw new Error('Colors API response structure is not as expected.');
    }
    return apiResponse.data;
}; 