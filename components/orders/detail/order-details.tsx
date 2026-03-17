"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus, OrderStatusType } from "@/components/orders/status/order-status"
import { formatFirebaseTimestamp, formatISODate } from "@/lib/utils"
import { CustomerInfoCard } from "./customer-info-card"
import { OrderProductsCard } from "./order-products-card"
import type { OrderItem } from "@/types/orders"
import { X, Download, MessageCircle, Receipt, ExternalLink, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { OrderPDF } from "./order-pdf"
import { useState, useEffect } from "react"
import { requestPaymentsService, type RequestPayment } from "@/services/request-payments"

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
    requestPaymentId?: string
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

const ComprobantePreview = ({
  link,
  fileName,
  onClick,
}: {
  link: string
  fileName?: string
  onClick?: () => void
}) => {
  const [imgError, setImgError] = useState(false)
  const ext = fileName?.toLowerCase().split(".").pop() ?? ""
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)

  if (!isImage || imgError) {
    return <FileText className="h-8 w-8 text-muted-foreground" />
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="h-full w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
      title="Ver comprobante"
    >
      <img
        src={link}
        alt="Comprobante"
        className="h-full w-full object-cover object-top"
        onError={() => setImgError(true)}
      />
    </button>
  )
}

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
  const [paymentRequest, setPaymentRequest] = useState<RequestPayment | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showComprobanteModal, setShowComprobanteModal] = useState(false)

  useEffect(() => {
    if (!order.requestPaymentId) return
    setPaymentLoading(true)
    requestPaymentsService
      .getById(order.requestPaymentId)
      .then((res) => {
        if (res?.data) setPaymentRequest(res.data)
      })
      .catch(() => {})
      .finally(() => setPaymentLoading(false))
  }, [order.requestPaymentId])

  useEffect(() => {
    if (!showComprobanteModal) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowComprobanteModal(false)
    }
    window.addEventListener("keydown", onEscape)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onEscape)
      document.body.style.overflow = ""
    }
  }, [showComprobanteModal])

  const kommoUrl =
    paymentRequest?.leadId && paymentRequest?.accountSubdomain
      ? `https://${paymentRequest.accountSubdomain}.kommo.com/leads/detail/${paymentRequest.leadId}`
      : paymentRequest?.leadId
        ? `https://app.kommo.com/leads/detail/${paymentRequest.leadId}`
        : null

  const attachmentLink = paymentRequest?.attachment?.link
  const attachmentFileName = paymentRequest?.attachment?.file_name
  const ext = attachmentFileName?.toLowerCase().split(".").pop() ?? ""
  const isImageAttachment = attachmentLink && ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)

  return (
    <>
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
        {/* Fecha, Total y Comprobante (fila compacta) */}
        <div className="flex flex-wrap items-start gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium">{formatISODate(order.date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">${order.total.toLocaleString("es-ES", {
              style: "currency",
              currency: "ARS",
            })}</p>
          </div>
          {order.requestPaymentId && (
            <div className="flex-1 min-w-[220px] rounded-lg border border-border bg-muted/20 overflow-hidden flex">
              {paymentLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 w-full">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Cargando comprobante...
                </div>
              ) : paymentRequest ? (
                <>
                  {/* Preview imagen a la izquierda (vertical) */}
                  <div className="w-14 h-20 shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                    {paymentRequest.attachment?.link ? (
                      <ComprobantePreview
                        link={paymentRequest.attachment.link}
                        fileName={paymentRequest.attachment.file_name}
                        onClick={() => setShowComprobanteModal(true)}
                      />
                    ) : (
                      <Receipt className="h-8 w-8 text-emerald-500/70" />
                    )}
                  </div>
                  {/* Datos a la derecha */}
                  <div className="flex-1 min-w-0 px-3 py-2 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      {paymentRequest.aiResult?.data?.amount != null && (
                        <>${paymentRequest.aiResult.data.amount.toLocaleString("es-AR")}</>
                      )}
                      {paymentRequest.aiResult?.data?.sender?.name && (
                        <span className="text-muted-foreground truncate">
                          · {paymentRequest.aiResult.data.sender.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {kommoUrl && (
                        <a
                          href={kommoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Kommo
                        </a>
                      )}
                      {paymentRequest.attachment?.link && (
                        <a
                          href={paymentRequest.attachment.link}
                          download={paymentRequest.attachment.file_name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-3 w-3" />
                          Descargar adjunto
                        </a>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground px-3 py-2 text-xs">Comprobante asociado</span>
              )}
            </div>
          )}
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

    {/* Modal preview comprobante */}
    {showComprobanteModal && isImageAttachment && attachmentLink && (
      <div
        className="fixed inset-0 z-[99999] flex flex-col bg-black/95"
        onClick={() => setShowComprobanteModal(false)}
      >
        <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-sm text-white/80">Orden #{order.numberOrder}</span>
          <button
            type="button"
            onClick={() => setShowComprobanteModal(false)}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className="flex-1 flex items-center justify-center p-4 min-h-0"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={attachmentLink}
            alt={`Comprobante orden ${order.numberOrder}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    )}
    </>
  )
} 