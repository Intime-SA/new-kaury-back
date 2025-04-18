import { OrderStatusType } from "@/app/components/OrderStatus"

export interface OrderItem {
  color: string
  descuento: number
  image: string | string[]
  name: string
  productId: string
  quantity: number
  subtotal: number
  talle: string | number
  unit_price: number
}

export interface InfoEntrega {
  apellido: string
  barrio: string
  calle: string
  ciudad: string
  codigoPostal: string
  email: string
  estado: string
  name: string
  numero: string
  pisoDpto: string
  telefono: string
}

export interface TipoDePago {
  pagoEfectivo: boolean
  pagoTransferencia: boolean
}

export interface Order {
  id: string
  numberOrder: number
  canalVenta: string
  client: string
  clienteId: string
  date: {
    _seconds: number
    _nanoseconds: number
  }
  envioSeleccionado: string
  infoEntrega: InfoEntrega
  lastState: string
  note: string
  orderItems: OrderItem[]
  status: OrderStatusType
  statusClass: string
  statusIcon: React.ReactNode
  sucursal: string[]
  telefono: string
  timestamp: number
  tipoDePago: TipoDePago
  tipoEnvio: number
  total: number
}
  