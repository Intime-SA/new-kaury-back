"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus, OrderStatusType } from "@/app/components/OrderStatus"
import { formatFirebaseTimestamp } from "@/lib/utils"
import { CustomerInfoCard } from "./customer-info-card"
import { OrderProductsCard } from "./order-products-card"
import type { OrderItem } from "@/types/orders"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { OrderPDF } from "./order-pdf"
import { useState, useEffect } from "react"

interface InfoEntrega {
  name: string
  apellido: string
  telefono: string
  email: string
  calle: string
  numero: string
  ciudad: string
  estado: string
  codigoPostal: string
  pisoDpto: string
  barrio: string
  dni: string
}

interface OrderDetailsProps {
  order: {
    id: string
    numberOrder: string
    date: any
    total: number
    orderItems: OrderItem[]
    infoEntrega: InfoEntrega
    status: OrderStatusType
    tipoEnvio: number
    envioSeleccionado?: string
  }
  onClose: () => void
}

const PDFButton = ({ order }: { order: OrderDetailsProps['order'] }) => {
  const isValidOrder = Boolean(
    order &&
    order.numberOrder &&
    order.orderItems?.length > 0 &&
    order.infoEntrega?.name &&
    order.infoEntrega?.apellido
  );

  if (!isValidOrder) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        disabled 
        title="Datos incompletos para generar PDF"
      >
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  // Crear una key única basada en el ID de la orden y su número
  const pdfKey = `pdf-${order.id}-${order.numberOrder}`;

  return (
    <div key={pdfKey}>
      <PDFDownloadLink
        document={<OrderPDF order={order} />}
        fileName={`orden-${order.numberOrder}.pdf`}
      >
        {({ loading, error }) => (
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={loading}
            title={error ? "Error al generar PDF" : loading ? "Generando PDF..." : "Descargar PDF"}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  // Log para debug
  useEffect(() => {
    console.log('OrderDetails recibió:', order);
  }, [order]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">#{order.numberOrder}</CardTitle>
        <div className="flex items-center gap-2">
          <PDFButton order={order} />
          <OrderStatus status={order.status} />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fecha y Total */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium">{formatFirebaseTimestamp(order.date)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">${order.total.toLocaleString("es-ES", {
              style: "currency",
              currency: "ARS",
            })}</p>
          </div>
        </div>

        {/* Información del Cliente */}
        <CustomerInfoCard info={order.infoEntrega} />

        {/* Productos */}
        <div className="space-y-4">
          <h3 className="font-semibold">Productos</h3>
          <OrderProductsCard items={order.orderItems} />
        </div>
      </CardContent>
    </Card>
  )
} 