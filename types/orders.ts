import { OrderStatusType } from "@/app/components/OrderStatus"

export interface OrderItem {
  id: string
  name: string
  unit_price: number
  quantity: number
  subtotal?: number
  color?: string
  talle?: string
  image?: string | string[]
  productId?: string
  descuento?: number
}

export interface InfoEntrega {
  apellido: string
  barrio: string
  calle: string
  ciudad: string
  codigoPostal: string
  dni: string
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
  numberOrder: string
  canalVenta: string
  client: string
  clienteId: string
  date: any
  envioSeleccionado: string
  infoEntrega: InfoEntrega
  lastState: string
  note: string
  orderItems: Array<{
    id: string
    name: string
    unit_price: number
    quantity: number
  }>
  status: OrderStatusType
  statusClass: string
  statusIcon: React.ReactNode
  sucursal: string[]
  telefono: string
  timestamp: number
  tipoDePago: TipoDePago
  tipoEnvio: number
  total: number
  direccion: {
    calle: string
    numero: string
    ciudad: string
    provincia: string
    codigoPostal: string
  }
}
  