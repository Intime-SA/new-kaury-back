const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PaymentMethod {
  _id: string;
  name: string;
  description: string;
  percentage: number;
  change: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethodResponse {
  methods: PaymentMethod[];
}

export interface CreatePaymentMethodData {
  name: string;
  description: string;
  percentage: number;
  change: boolean;
  active: boolean;
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {}

class PaymentsService {
  private baseUrl: string;

  constructor() {
    if (!API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not defined');
    }
    this.baseUrl = `${API_BASE_URL}/payments/manage`;
  }

  // GET /api/payments/manage
  async getAll(): Promise<PaymentMethodResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener métodos de pago');
    return await response.json();
  }

  // POST /api/payments/manage
  async create(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear método de pago');
    return await response.json();
  }

  // PUT /api/payments/manage/[id]
  async update(id: string, data: UpdatePaymentMethodData): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar método de pago');
    return await response.json();
  }

  // DELETE /api/payments/manage/[id]
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al eliminar método de pago');
  }
}

export const paymentsService = new PaymentsService(); 