const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type GiftTriggerType = 'minAmount' | 'always';
export type GiftAudience = 'all' | 'wholesale' | 'retail';

export interface Gift {
  _id: string;
  name: string;
  description?: string;
  productId: string;
  variantId: string;
  productName?: string;
  productImage?: string;
  triggerType: GiftTriggerType;
  triggerValue?: number;
  audience: GiftAudience;
  validFrom?: string | null;
  validUntil?: string | null;
  active: boolean;
  requiresPurchaseHistory?: boolean;
  purchaseHistoryWindowDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftsResponse {
  gifts: Gift[];
}

export interface CreateGiftData {
  name: string;
  description?: string;
  productId: string;
  variantId: string;
  productName?: string;
  productImage?: string;
  triggerType: GiftTriggerType;
  triggerValue?: number;
  audience: GiftAudience;
  validFrom?: string | null;
  validUntil?: string | null;
  active: boolean;
  requiresPurchaseHistory?: boolean;
  purchaseHistoryWindowDays?: number;
}

export type UpdateGiftData = Partial<CreateGiftData>;

class GiftsService {
  private baseUrl: string;

  constructor() {
    if (!API_BASE_URL) throw new Error('NEXT_PUBLIC_API_BASE_URL no está definida');
    this.baseUrl = API_BASE_URL;
  }

  async getAll(): Promise<GiftsResponse> {
    const r = await fetch(`${this.baseUrl}/gifts`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) throw new Error('Error al obtener regalos');
    return await r.json();
  }

  async getById(id: string): Promise<{ gift: Gift }> {
    const r = await fetch(`${this.baseUrl}/gifts/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) throw new Error('Error al obtener regalo');
    return await r.json();
  }

  async create(data: CreateGiftData): Promise<{ gift: Gift }> {
    const r = await fetch(`${this.baseUrl}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json?.message || 'Error al crear regalo');
    return json;
  }

  async update(id: string, data: UpdateGiftData): Promise<void> {
    const r = await fetch(`${this.baseUrl}/gifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json?.message || 'Error al actualizar regalo');
  }

  async delete(id: string): Promise<void> {
    const r = await fetch(`${this.baseUrl}/gifts/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) throw new Error('Error al eliminar regalo');
  }
}

export const giftsService = new GiftsService();
