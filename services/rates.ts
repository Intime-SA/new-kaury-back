const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ShippingRateRequest {
  rates: ShippingRate[];
}

export interface ShippingRate {
  _id: string;
  deliveredType: string;
  productType: string;
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}

export interface CreateShippingRateData {
  deliveredType: string;
  productType: string;
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}


export async function getShippingRates(requestData: {
  dimensiones: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
  codigoPostal: string;
  tipoEntregaServicio: string;
}): Promise<ShippingRate[]> {
  const response = await fetch(`${API_BASE_URL}/shipping/rates?source=internal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error('Error al obtener las tarifas de envío');
  }

  if (!text) {
    throw new Error('El backend no devolvió datos');
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Respuesta inválida del backend');
  }
}

class ShippingRatesService {
  private baseUrl: string;

  constructor() {
    if (!API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not defined');
    }
    this.baseUrl = `${API_BASE_URL}/shipping`;
  }

  // GET /api/shipping/rates/manage
  async getAll(requestData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/rates?source=internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      throw new Error('Failed to fetch shipping rates');
    }
  }

  // POST /api/shipping/rates/manage
  async create(shippingRateData: CreateShippingRateData): Promise<ShippingRate> {
    try {
      const response = await fetch(`${this.baseUrl}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingRateData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating shipping rate:', error);
      throw new Error('Failed to create shipping rate');
    }
  }

  // PUT /api/shipping/rates/manage
  async update(id: string, shippingRateData: CreateShippingRateData): Promise<ShippingRate> {
    try {
      const response = await fetch(`${this.baseUrl}/manage/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingRateData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating shipping rate:', error);
      throw new Error('Failed to update shipping rate');
    }
  }

  // DELETE /api/shipping/rates/manage?id=<id>
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/manage?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting shipping rate:', error);
      throw new Error('Failed to delete shipping rate');
    }
  }

  async search(params: {
    deliveredType?: string;
    productType?: string;
    productName?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ShippingRate[]> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/manage/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching shipping rates:', error);
      throw new Error('Failed to search shipping rates');
    }
  }

  async getStats(): Promise<{
    total: number;
    averagePrice: number;
    averageDeliveryTime: number;
    byDeliveryType: Record<string, number>;
    byProductType: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/manage/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching shipping rates stats:', error);
      throw new Error('Failed to fetch shipping rates statistics');
    }
  }
}

export const shippingRatesService = new ShippingRatesService();
