import { OrderStatusType } from "@/components/orders/status/order-status"
import { ReactNode } from "react";

// interface para el componente OrdersTable
export interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  onSelectOrder?: (order: Order | null) => void;
  selectedOrderId?: string;
  reports: {
    current: {
      totalSales: number;
      totalAmount: number;
      averageSale: number;
    };
    previous: {
      totalSales: number;
      totalAmount: number;
      averageSale: number;
    };
    percentageChange: {
      totalSales: number;
      totalAmount: number;
      averageSale: number;
    };
  };
}

// interface para el componente OrdersKPIs
export interface OrdersKPIsProps {
  reports?: {
    current: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
    previous: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
    percentageChange: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
  }
  loading: boolean
  hasDateFilter?: boolean
}


// interface para el componente OrdersTabs
export interface OrdersTabsProps {
  orders: {
    nueva: number
    empaquetada: number
    pagoRecibido: number
    enviada: number
    cancelada: number
    archivada: number
  }
  content: ReactNode
}

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
  _id: string
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
  