const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export type RequestPaymentStatus =
  | 'pending'
  | 'nueva'
  | 'pagoRecibido'
  | 'empaquetada'
  | 'archivada'
  | 'cancelada'

export interface RequestPaymentAiSender {
  name?: string
  cuit?: string
  platform?: string
  cvu?: string
  operationNumber?: string
}

export interface RequestPaymentAiData {
  amount?: number
  date?: string
  time?: string
  sender?: RequestPaymentAiSender
  operationNumber?: string
}

export interface RequestPayment {
  _id: string
  date: string
  status: RequestPaymentStatus
  aiResult: {
    success: boolean
    data?: RequestPaymentAiData
  }
  attachment?: {
    type?: string
    link: string
    file_name: string
  }
  contactPhone?: string
  leadId?: string
  accountSubdomain?: string
  orderIds?: string[]
  orders?: UserOrder[]
}

export interface UserOrder {
  _id: string
  numberOrder: number
  status: string
  total: number
  telefono?: string
  infoEntrega?: {
    name?: string
    apellido?: string
    telefono?: string
    email?: string
  }
  orderItems?: Array<{ name: string; quantity: number; unit_price: number }>
}

export interface RequestPaymentsPagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type KpiFilterValue = 'all' | 'sinAsociar' | 'pendientes' | 'pagoRecibido' | 'cancelada'

export interface ListRequestPaymentsParams {
  page?: number
  limit?: number
  kpiFilter?: KpiFilterValue
  dateFrom?: string
  dateTo?: string
}

export interface RequestPaymentsKpis {
  total: number
  sinAsociar: number
  pendientes: number
  pagoRecibido: number
  cancelada: number
}

export interface RequestPaymentsAmounts {
  total: number
  confirmed: number
  pending: number
}

export interface ListRequestPaymentsResponse {
  success: boolean
  data: RequestPayment[]
  pagination?: RequestPaymentsPagination
  kpis?: RequestPaymentsKpis
  amounts?: RequestPaymentsAmounts
}

export interface GetRequestPaymentResponse {
  success: boolean
  data: RequestPayment
}

export interface UpdateRequestPaymentBody {
  orderIds?: string[]
  status?: RequestPaymentStatus
}

export interface AutoMatchResponse {
  success: boolean
  matched?: boolean
  orderId?: string
  orderNumber?: number
  message?: string
  data?: RequestPayment
}

export interface ListUserOrdersParams {
  status?: string
  numberOrder?: string
  date?: string
  page?: number
  limit?: number
}

export interface ListUserOrdersResponse {
  success: boolean
  data: UserOrder[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class RequestPaymentsService {
  private baseUrl: string

  constructor() {
    if (!API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL no está definida')
    }
    this.baseUrl = `${API_BASE_URL}/request-payments`
  }

  async list(params: ListRequestPaymentsParams = {}): Promise<ListRequestPaymentsResponse> {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.kpiFilter && params.kpiFilter !== 'all') searchParams.append('kpiFilter', params.kpiFilter)
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom)
    if (params.dateTo) searchParams.append('dateTo', params.dateTo)

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Error al listar payment requests')
    return response.json()
  }

  async getById(id: string): Promise<GetRequestPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      if (response.status === 404) throw new Error('Payment request no encontrado')
      throw new Error('Error al obtener payment request')
    }
    return response.json()
  }

  async update(
    id: string,
    body: UpdateRequestPaymentBody
  ): Promise<GetRequestPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Error al actualizar payment request')
    }
    return response.json()
  }

  async autoMatch(id: string): Promise<AutoMatchResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'autoMatch' }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Error en auto-match')
    return data
  }

  /**
   * Marca como pago recibido: request-payment + órdenes asociadas.
   * Requiere que existan orderIds.
   */
  async confirmPayment(id: string): Promise<GetRequestPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirmPayment' }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Error al confirmar pago')
    }
    return data
  }

  /**
   * Desasocia una orden del payment request.
   * PATCH con action: "disassociateOrder" y orderId.
   * No permite desasociar si status es pagoRecibido (request-payment u orden).
   */
  async disassociateOrder(
    requestPaymentId: string,
    orderId: string
  ): Promise<GetRequestPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/${requestPaymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'disassociateOrder', orderId }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Error al desasociar orden')
    }
    return data
  }
}

class UserOrdersService {
  private baseUrl: string

  constructor() {
    if (!API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL no está definida')
    }
    this.baseUrl = `${API_BASE_URL}/userOrders`
  }

  async list(params: ListUserOrdersParams = {}): Promise<ListUserOrdersResponse> {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.append('status', params.status)
    if (params.numberOrder) searchParams.append('numberOrder', params.numberOrder)
    if (params.date) searchParams.append('date', params.date)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const url = `${this.baseUrl}?${searchParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Error al listar órdenes')
    return response.json()
  }

  async getById(id: string): Promise<{ success: boolean; data: UserOrder }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Error al obtener orden')
    return response.json()
  }
}

export const requestPaymentsService = new RequestPaymentsService()
export const userOrdersService = new UserOrdersService()
