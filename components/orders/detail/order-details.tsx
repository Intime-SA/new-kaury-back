"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus, OrderStatusType } from "@/components/orders/status/order-status"
import { formatFirebaseTimestamp, formatISODate } from "@/lib/utils"
import { CustomerInfoCard } from "./customer-info-card"
import { OrderProductsCard } from "./order-products-card"
import type { OrderItem, GiftItemSummary, TipoDePago } from "@/types/orders"
import { X, Download, Receipt, ExternalLink, Loader2, FileText, Truck, CreditCard, Banknote, Tag, StickyNote, BadgePercent, Gift, Wallet } from "lucide-react"
import { KauryWhatsapp } from "@/components/icons"
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
    canalVenta?: string
    note?: string
    tipoDePago?: TipoDePago
    cupon?: {
      codigo?: string
      descuento?: number
      tipo?: string
    } | null
    cuponCodigo?: string
    cuponDescuento?: number
    descuento?: number
    recargo?: number
    subtotal?: number
    costoEnvio?: number
    couponCode?: string | null
    couponType?: "percent" | "fixed" | null
    couponDiscount?: number
    giftItems?: GiftItemSummary[]
  }
  onClose: () => void
}

const formatARS = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 })

// Convierte códigos camelCase/kebab del backend en texto legible
// "envioDomicilio" → "Envío a domicilio", "retiroSucursal" → "Retiro en sucursal"
const formatShippingMethod = (raw?: string | null): string => {
  if (!raw) return "—"
  const v = raw.trim()
  const mapping: Record<string, string> = {
    enviodomicilio: "Envío a domicilio",
    envioadomicilio: "Envío a domicilio",
    retirosucursal: "Retiro en sucursal",
    retirashowroom: "Retiro en showroom",
    retiroenshowroom: "Retiro en showroom",
    showroom: "Retiro en showroom",
    correoargentino: "Correo Argentino",
    andreani: "Andreani",
    oca: "OCA",
  }
  const key = v.toLowerCase().replace(/[\s_-]/g, "")
  if (mapping[key]) return mapping[key]
  // Fallback: separar camelCase y capitalizar
  const spaced = v
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
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
      className="text-success hover:bg-success/10"
    >
      <KauryWhatsapp className="h-4 w-4" />
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
    <Card className="h-full overflow-auto scroll-hidden border-0 rounded-2xl shadow-none">
      <CardHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border/60 flex flex-row items-center justify-between space-y-0 pb-2.5 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Orden</p>
          <CardTitle className="text-base font-bold mt-0.5 truncate">
            <span className="text-primary">#</span>{order.numberOrder}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <PDFButton order={order} />
          <WhatsAppButton order={order} />
          <OrderStatus status={order.status} />
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="h-7 w-7">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pt-4 pb-5">
        {/* Badges de información de pago/promos */}
        <OrderBadges order={order} />

        {/* Fecha, Total y Comprobante (fila compacta) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Fecha</p>
            <p className="mt-0.5 text-xs font-semibold">{formatISODate(order.date)}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-gradient-brand-soft p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-primary/70">Total</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              {order.total.toLocaleString("es-ES", { style: "currency", currency: "ARS" })}
            </p>
          </div>
          {order.requestPaymentId && (
            <div className="col-span-2 rounded-xl border border-success/20 bg-success/5 overflow-hidden flex">
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
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Productos · {order.orderItems?.length || 0}
          </h3>
          <OrderProductsCard items={order.orderItems} />
        </div>

        {/* Desglose del total */}
        <OrderTotalBreakdown order={order} />
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

// ============================================================================
// Helpers de cálculo (cupón, recargo, surcharge derivado)
// ============================================================================
function getOrderComputed(order: OrderDetailsProps["order"]) {
  const subtotal =
    Number(order.subtotal ?? order.orderItems?.reduce((acc, it) => acc + (it.unit_price || 0) * (it.quantity || 0), 0) ?? 0)
  const costoEnvio = Number(order.costoEnvio ?? 0)

  // Cupón: priorizar nuevo schema (couponCode/couponDiscount), caer en legacy
  const couponCode = order.couponCode ?? order.cupon?.codigo ?? order.cuponCodigo ?? null
  const couponDiscount = Number(
    order.couponDiscount ?? order.cupon?.descuento ?? order.cuponDescuento ?? order.descuento ?? 0
  )

  // Recargo derivado o explícito (transferencia + retiro suele tener)
  const recargoExplicito = Number(order.recargo ?? 0)
  const expectedBeforeSurcharge = Math.max(0, subtotal + costoEnvio - couponDiscount)
  const surchargeDerivado = Math.max(0, Number(order.total) - expectedBeforeSurcharge)
  const recargo = recargoExplicito > 0 ? recargoExplicito : surchargeDerivado
  const surchargePct =
    expectedBeforeSurcharge > 0 ? Math.round((recargo / expectedBeforeSurcharge) * 100) : 0

  const giftItems: GiftItemSummary[] = order.giftItems || []

  return { subtotal, costoEnvio, couponCode, couponDiscount, recargo, surchargePct, giftItems }
}

// ============================================================================
// Badges de información (pago, envío, recargo, cupón, regalos)
// ============================================================================
function OrderBadges({ order }: { order: OrderDetailsProps["order"] }) {
  const tipoDePago = order.tipoDePago
  const isMP = !!tipoDePago?.pagoMercadoPago
  const isTransfer = !!tipoDePago?.pagoTransferencia
  const isCash = !!tipoDePago?.pagoEfectivo
  const isPickup = order.tipoEnvio === 2

  const { couponCode, couponDiscount, recargo, surchargePct, giftItems } = getOrderComputed(order)
  const hasSurcharge = isTransfer && isPickup && recargo > 1
  const hasCoupon = !!couponCode && couponDiscount > 0
  const hasGifts = giftItems.length > 0

  const badges: React.ReactNode[] = []

  if (isMP) {
    badges.push(
      <span key="mp" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-info/10 text-info border border-info/30">
        <CreditCard className="h-2.5 w-2.5" /> Mercado Pago
      </span>,
    )
  }
  if (isTransfer) {
    badges.push(
      <span key="tr" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-info/10 text-info border border-info/30">
        <Wallet className="h-2.5 w-2.5" /> Transferencia
      </span>,
    )
  }
  if (isCash) {
    badges.push(
      <span key="ca" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-success/10 text-success border border-success/30">
        <Banknote className="h-2.5 w-2.5" /> Efectivo
      </span>,
    )
  }
  if (hasSurcharge) {
    badges.push(
      <span key="sur" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-warning/10 text-warning border border-warning/30">
        <BadgePercent className="h-2.5 w-2.5" />
        Recargo{surchargePct > 0 ? ` ${surchargePct}%` : ""} (+{formatARS(recargo)})
      </span>,
    )
  }
  if (hasCoupon) {
    badges.push(
      <span key="cp" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/30">
        <Tag className="h-2.5 w-2.5" />
        Cupón {couponCode} (−{formatARS(couponDiscount)})
      </span>,
    )
  }
  if (hasGifts) {
    badges.push(
      <span key="gf" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-pink-500/10 text-pink-600 border border-pink-500/30">
        <Gift className="h-2.5 w-2.5" />
        {giftItems.length === 1 ? "Regalo incluido" : `${giftItems.length} regalos`}
      </span>,
    )
  }
  badges.push(
    <span
      key="env"
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border"
    >
      <Truck className="h-2.5 w-2.5" />
      {isPickup ? "Retiro en showroom" : formatShippingMethod(order.envioSeleccionado) || "Envío a domicilio"}
    </span>,
  )

  if (badges.length === 0) return null
  return <div className="flex flex-wrap gap-1.5">{badges}</div>
}

// ============================================================================
// Desglose del total + nota
// ============================================================================
function OrderTotalBreakdown({ order }: { order: OrderDetailsProps["order"] }) {
  const { subtotal, costoEnvio, couponCode, couponDiscount, recargo } = getOrderComputed(order)
  const hasBreakdown = subtotal > 0 || costoEnvio > 0 || couponDiscount > 0 || recargo > 0

  return (
    <>
      {order.note && (
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3 flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground mt-0.5">
            <StickyNote className="h-3 w-3" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Nota</p>
            <p className="text-xs text-foreground">{order.note}</p>
          </div>
        </div>
      )}

      {hasBreakdown && (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Desglose
          </h3>
          {subtotal > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatARS(subtotal)}</span>
            </div>
          )}
          {costoEnvio > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-medium text-foreground">{formatARS(costoEnvio)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Cupón {couponCode || ""}</span>
              <span className="font-medium text-success">−{formatARS(couponDiscount)}</span>
            </div>
          )}
          {recargo > 1 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Recargo</span>
              <span className="font-medium text-warning">+{formatARS(recargo)}</span>
            </div>
          )}
          <div className="border-t border-border/60 pt-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Total</span>
            <span className="text-sm font-bold text-foreground">{formatARS(Number(order.total))}</span>
          </div>
        </div>
      )}
    </>
  )
}
