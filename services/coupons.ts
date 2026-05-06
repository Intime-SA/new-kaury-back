const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type CouponType = 'percent' | 'fixed';
export type CouponAudience = 'all' | 'wholesale' | 'retail';

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minAmount?: number;
  maxUses?: number | null;
  usesCount: number;
  perUserLimit?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  audience: CouponAudience;
  stackable: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponsResponse {
  coupons: Coupon[];
}

export interface CreateCouponData {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minAmount?: number;
  maxUses?: number | null;
  perUserLimit?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  audience: CouponAudience;
  stackable: boolean;
  active: boolean;
}

export type UpdateCouponData = Partial<CreateCouponData>;

class CouponsService {
  private baseUrl: string;

  constructor() {
    if (!API_BASE_URL) throw new Error('NEXT_PUBLIC_API_BASE_URL no está definida');
    this.baseUrl = API_BASE_URL;
  }

  async getAll(): Promise<CouponsResponse> {
    const r = await fetch(`${this.baseUrl}/coupons`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) throw new Error('Error al obtener cupones');
    return await r.json();
  }

  async getById(id: string): Promise<{ coupon: Coupon }> {
    const r = await fetch(`${this.baseUrl}/coupons/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) throw new Error('Error al obtener cupón');
    return await r.json();
  }

  async create(data: CreateCouponData): Promise<{ coupon: Coupon }> {
    const r = await fetch(`${this.baseUrl}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json?.message || 'Error al crear cupón');
    return json;
  }

  async update(id: string, data: UpdateCouponData): Promise<void> {
    const r = await fetch(`${this.baseUrl}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json?.message || 'Error al actualizar cupón');
  }

  async delete(id: string): Promise<void> {
    const r = await fetch(`${this.baseUrl}/coupons/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) throw new Error('Error al eliminar cupón');
  }
}

export const couponsService = new CouponsService();
