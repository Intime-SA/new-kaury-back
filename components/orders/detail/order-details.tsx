"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus, OrderStatusType } from "@/components/orders/status/order-status"
import { formatFirebaseTimestamp, formatISODate } from "@/lib/utils"
import { CustomerInfoCard } from "./customer-info-card"
import { OrderProductsCard } from "./order-products-card"
import type { OrderItem } from "@/types/orders"
import { X, Download, MessageCircle } from "lucide-react"
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

const WhatsAppButton = ({ order }: { order: OrderDetailsProps['order'] }) => {
  const handleWhatsAppClick = () => {
    const phone = order.infoEntrega?.telefono;
    if (!phone) {
      alert("No hay número de teléfono disponible");
      return;
    }

    // Limpiar el número de teléfono (remover espacios, guiones, etc.)
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
    
    // Asegurar que tenga el código de país (Argentina: +54)
    const phoneWithCountry = cleanPhone.startsWith('+54') ? cleanPhone : 
                           cleanPhone.startsWith('54') ? `+${cleanPhone}` :
                           cleanPhone.startsWith('9') ? `+54${cleanPhone}` :
                           `+54${cleanPhone}`;

    // Crear mensaje predeterminado
    const message = `Hola ${order.infoEntrega.name} ${order.infoEntrega.apellido}, te contactamos desde Kaury sobre tu orden #${order.numberOrder}.`;
    
    // Crear enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
  };

  const hasPhone = Boolean(order.infoEntrega?.telefono);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleWhatsAppClick}
      disabled={!hasPhone}
      title={hasPhone ? "Contactar por WhatsApp" : "No hay teléfono disponible"}
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
};

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  console.log(order, 'order');

  return (
    <Card className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">#{order.numberOrder}</CardTitle>
        <div className="flex items-center gap-2">
          <PDFButton order={order} />
          <WhatsAppButton order={order} />
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
            <p className="font-medium">{formatISODate(order.date)}</p>
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
        <CustomerInfoCard info={order.infoEntrega}/>

        {/* Productos */}
        <div className="space-y-4">
          <h3 className="font-semibold">Productos</h3>
          <OrderProductsCard items={order.orderItems} />
        </div>
      </CardContent>
    </Card>
  )
} 