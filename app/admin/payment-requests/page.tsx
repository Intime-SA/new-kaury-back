'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { format, subDays, startOfMonth, endOfMonth, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Receipt,
  RefreshCw,
  Link2,
  Loader2,
  XCircle,
  CheckCircle2,
  ImageIcon,
  Zap,
  Clock,
  Banknote,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Eye,
  CreditCard,
  User,
  Phone,
  Building2,
  Hash,
  ArrowRight,
  Sparkles,
  FileText,
  LinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  requestPaymentsService,
  userOrdersService,
  type RequestPayment,
  type UserOrder,
  type RequestPaymentStatus,
  type RequestPaymentsPagination,
  type RequestPaymentsKpis,
  type RequestPaymentsAmounts,
  type KpiFilterValue,
  type ListUserOrdersResponse,
} from '@/services/request-payments'

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const STATUS_LABELS: Record<RequestPaymentStatus, string> = {
  pending: 'Pendiente',
  nueva: 'Nueva',
  pagoRecibido: 'Pago Recibido',
  empaquetada: 'Empaquetada',
  archivada: 'Archivada',
  cancelada: 'Cancelada',
}

const STATUS_DESCRIPTIONS: Record<RequestPaymentStatus, string> = {
  pending: 'Comprobante recibido, pendiente de procesar',
  nueva: 'Comprobante procesado, pendiente de asociar a una orden',
  pagoRecibido: 'Pago confirmado y asociado a una orden',
  empaquetada: 'Orden empaquetada y lista para envío',
  archivada: 'Comprobante archivado',
  cancelada: 'Comprobante cancelado',
}

const STATUS_COLORS: Record<RequestPaymentStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  nueva: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pagoRecibido: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  empaquetada: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  archivada: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelada: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_ICONS: Record<RequestPaymentStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  nueva: <Sparkles className="h-3 w-3" />,
  pagoRecibido: <CheckCircle2 className="h-3 w-3" />,
  empaquetada: <FileText className="h-3 w-3" />,
  archivada: <FileText className="h-3 w-3" />,
  cancelada: <XCircle className="h-3 w-3" />,
}

// Clasificación para las dos columnas
const isPendientePago = (p: RequestPayment) => {
  const hasOrders = p.orderIds && p.orderIds.length > 0
  const statusPendiente =
    p.status === 'pending' ||
    p.status === 'nueva' ||
    p.status === 'cancelada'
  return !hasOrders || statusPendiente
}

const isPagoRecibido = (p: RequestPayment) => {
  const hasOrders = p.orderIds && p.orderIds.length > 0
  return (
    hasOrders &&
    ['pagoRecibido', 'empaquetada', 'archivada'].includes(p.status)
  )
}

const isAsociadoPendiente = (p: RequestPayment) => {
  const hasOrders = p.orderIds && p.orderIds.length > 0
  return hasOrders && (p.status === 'pending' || p.status === 'nueva')
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status, showIcon = false }: { status: RequestPaymentStatus; showIcon?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn('font-medium gap-1', STATUS_COLORS[status] || 'bg-muted text-muted-foreground')}
        >
          {showIcon && STATUS_ICONS[status]}
          {STATUS_LABELS[status] || status}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{STATUS_DESCRIPTIONS[status]}</p>
      </TooltipContent>
    </Tooltip>
  )
}

interface KpiCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  trend?: { value: number; isPositive: boolean }
  accentColor: string
  percentage?: number
  onClick?: () => void
  isActive?: boolean
}

function KpiCard({
  title,
  value,
  icon,
  description,
  trend,
  accentColor,
  percentage,
  onClick,
  isActive,
}: KpiCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md hover:border-muted-foreground/30',
            isActive && 'ring-2 ring-primary/50 border-primary/30'
          )}
          onClick={onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={cn('p-2 rounded-lg', accentColor)}>
                {icon}
              </div>
              {trend && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
            </div>
            {percentage !== undefined && (
              <div className="mt-3">
                <Progress value={percentage} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {percentage.toFixed(1)}% del total
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function PaymentCard({
  pr,
  isSelected,
  onSelect,
}: {
  pr: RequestPayment
  isSelected: boolean
  onSelect: () => void
}) {
  const amount = pr.aiResult?.data?.amount ?? 0
  const sender = pr.aiResult?.data?.sender?.name ?? '-'
  const platform = pr.aiResult?.data?.sender?.platform
  const hasOrders = pr.orderIds && pr.orderIds.length > 0
  const isPendiente = isPendientePago(pr)
  const timeAgo = pr.date ? formatDistanceToNow(new Date(pr.date), { addSuffix: true, locale: es }) : null

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group rounded-lg border border-border bg-card p-3 cursor-pointer transition-all hover:border-muted-foreground/30 hover:shadow-sm',
        isSelected && 'ring-2 ring-primary/50 border-primary/30 bg-accent/50'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <Tooltip>
          <TooltipTrigger asChild>
            {pr.attachment?.link ? (
              <a
                href={pr.attachment.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted ring-1 ring-border hover:ring-primary/50 transition-all"
              >
                <img
                  src={pr.attachment.link}
                  alt="Comprobante"
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center ring-1 ring-border">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>Click para ver comprobante completo</p>
          </TooltipContent>
        </Tooltip>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate text-sm">
              {sender || 'Sin remitente'}
            </p>
            {platform && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/50">
                    {platform}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Plataforma de pago</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-foreground">
              {amount > 0 ? formatCurrency(amount) : '-'}
            </span>
            <span className="text-muted-foreground">·</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground">
                  {pr.date ? format(new Date(pr.date), 'd MMM HH:mm', { locale: es }) : '-'}
                </span>
              </TooltipTrigger>
              <TooltipContent>{timeAgo}</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {pr.status === 'cancelada' ? (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0 gap-1">
                <XCircle className="h-2.5 w-2.5" />
                Cancelada
              </Badge>
            ) : hasOrders ? (
              isPendiente ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  Confirmar pago
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0 gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Recibido
                </Badge>
              )
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] px-1.5 py-0 gap-1">
                    <LinkIcon className="h-2.5 w-2.5" />
                    Sin asociar
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Este comprobante no tiene órdenes asociadas.</p>
                  <p className="text-muted-foreground">Usa Auto-match o asocia manualmente.</p>
                </TooltipContent>
              </Tooltip>
            )}
            {hasOrders && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Hash className="h-2.5 w-2.5" />
                      {pr.orderIds!.length} orden{pr.orderIds!.length !== 1 ? 'es' : ''}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Órdenes asociadas a este comprobante
                  </TooltipContent>
                </Tooltip>
                {pr.orderIds?.[0] && (
                  <Link
                    href={`/?openOrder=${pr.orderIds[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    <ArrowRight className="h-2.5 w-2.5" />
                    Ver orden{pr.orders?.[0] ? ` #${pr.orders[0].numberOrder}` : ''}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick view icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Ver detalles</TooltipContent>
        </Tooltip>
      </div>

      {/* Payment info & contact */}
      {(pr.contactPhone || pr.aiResult?.data?.operationNumber) && (
        <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {pr.contactPhone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {pr.contactPhone}
                </span>
              </TooltipTrigger>
              <TooltipContent>Teléfono de contacto del remitente</TooltipContent>
            </Tooltip>
          )}
          {pr.aiResult?.data?.operationNumber && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Op. {pr.aiResult.data.operationNumber}
                </span>
              </TooltipTrigger>
              <TooltipContent>Número de operación</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  )
}

function OrderSelector({
  open,
  onOpenChange,
  onSelect,
  excludeIds = [],
  amountHint,
  phoneHint,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (order: UserOrder) => void
  excludeIds?: string[]
  amountHint?: number
  phoneHint?: string
}) {
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) {
      setLoading(true)
      userOrdersService
        .list({ status: 'nueva', limit: 50 })
        .then((res: ListUserOrdersResponse) => {
          setOrders(res.data.filter((o: UserOrder) => !excludeIds.includes(o._id)))
        })
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [open, excludeIds.join(',')])

  const filtered = orders
    .filter((o) => {
      if (!search) return true
      return (
        o.numberOrder.toString().includes(search) ||
        o.infoEntrega?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.infoEntrega?.apellido?.toLowerCase().includes(search.toLowerCase()) ||
        o.telefono?.includes(search) ||
        o.infoEntrega?.telefono?.includes(search) ||
        (o.total != null && String(Number(o.total)).includes(search))
      )
    })
    .sort((a, b) => {
      const numHint = Number(amountHint)
      if (!amountHint || numHint <= 0) return 0
      const aMatch =
        a.total != null &&
        Math.abs(Number(a.total) - numHint) / numHint < 0.05
      const bMatch =
        b.total != null &&
        Math.abs(Number(b.total) - numHint) / numHint < 0.05
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return 0
    })

  const matchCount = filtered.filter((o) => {
    const numHint = Number(amountHint)
    return amountHint && numHint > 0 && o.total != null &&
      Math.abs(Number(o.total) - numHint) / numHint < 0.05
  }).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Asociar orden
          </DialogTitle>
          <DialogDescription>
            Selecciona una orden en estado &quot;nueva&quot; para asociar al comprobante de pago.
          </DialogDescription>
        </DialogHeader>

        {/* Hints banner */}
        {(amountHint || phoneHint) && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-500">Sugerencias basadas en el comprobante</p>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                  {amountHint && (
                    <span className="flex items-center gap-1">
                      <Banknote className="h-3 w-3" />
                      Monto: {formatCurrency(amountHint)}
                    </span>
                  )}
                  {phoneHint && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Tel: {phoneHint}
                    </span>
                  )}
                </div>
                {matchCount > 0 && (
                  <p className="text-xs text-emerald-500 mt-1.5">
                    {matchCount} orden{matchCount !== 1 ? 'es' : ''} coincide{matchCount === 1 ? '' : 'n'} con el monto (±5%)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col gap-2">
          <Input
            placeholder="Buscar por nº orden, nombre, teléfono, monto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="flex-1 overflow-auto rounded-lg border border-border">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No hay órdenes nuevas disponibles</p>
                <p className="text-xs mt-1">Las órdenes deben estar en estado &quot;nueva&quot;</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => {
                    const phone = order.telefono || order.infoEntrega?.telefono || '-'
                    const name =
                      [order.infoEntrega?.name, order.infoEntrega?.apellido].filter(Boolean).join(' ') || '-'
                    const numHint = Number(amountHint)
                    const isAutoMatch =
                      amountHint != null &&
                      numHint > 0 &&
                      order.total != null &&
                      Math.abs(Number(order.total) - numHint) / numHint < 0.05

                    return (
                      <TableRow
                        key={order._id}
                        className={cn(
                          isAutoMatch &&
                            'bg-emerald-500/5 border-l-4 border-l-emerald-500 hover:bg-emerald-500/10'
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            {isAutoMatch && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-emerald-500">
                                    <Sparkles className="h-3.5 w-3.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">Coincidencia sugerida</p>
                                  <p className="text-muted-foreground">El monto coincide con el comprobante (±5%)</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            #{order.numberOrder}
                          </div>
                        </TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell className="text-muted-foreground">{phone}</TableCell>
                        <TableCell className="text-right">
                          <span className={isAutoMatch ? 'text-emerald-500 font-semibold' : ''}>
                            {formatCurrency(order.total)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={isAutoMatch ? 'default' : 'outline'}
                            onClick={() => {
                              onSelect(order)
                              onOpenChange(false)
                            }}
                          >
                            Asociar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <DialogFooter className="text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          Mostrando {filtered.length} de {orders.length} órdenes disponibles
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// PAGE
// ============================================================================

const DEFAULT_LIMIT = 30
const KPI_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos', icon: Receipt },
  { value: 'sinAsociar', label: 'Sin asociar', icon: Link2 },
  { value: 'pendientes', label: 'Pendientes', icon: Clock },
  { value: 'pagoRecibido', label: 'Pago recibido', icon: CheckCircle2 },
  { value: 'cancelada', label: 'Cancelada', icon: XCircle },
] as const

const DATE_PRESETS = [
  { label: 'Hoy', getRange: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Últimos 7 días', getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Últimos 30 días', getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'Este mes', getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
]

const DEFAULT_DATE_RANGE = (() => {
  const to = new Date()
  const from = subDays(to, 6)
  return { from, to }
})()

export default function PaymentRequestsAdminPage() {
  const [payments, setPayments] = useState<RequestPayment[]>([])
  const [pagination, setPagination] = useState<RequestPaymentsPagination | null>(null)
  const [kpis, setKpis] = useState<RequestPaymentsKpis | null>(null)
  const [amounts, setAmounts] = useState<RequestPaymentsAmounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<RequestPayment | null>(null)
  const [orderSelectorOpen, setOrderSelectorOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [autoMatchingId, setAutoMatchingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    kpiFilter: 'all' as KpiFilterValue,
    dateFrom: format(DEFAULT_DATE_RANGE.from, 'yyyy-MM-dd'),
    dateTo: format(DEFAULT_DATE_RANGE.to, 'yyyy-MM-dd'),
  })
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(DEFAULT_DATE_RANGE)
  const { toast } = useToast()

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
      }
      if (filters.kpiFilter && filters.kpiFilter !== 'all') params.kpiFilter = filters.kpiFilter
      if (filters.dateFrom?.trim()) params.dateFrom = filters.dateFrom
      if (filters.dateTo?.trim()) params.dateTo = filters.dateTo

      const res = await requestPaymentsService.list(params)
      setPayments(res.data || [])
      setPagination(res.pagination || null)
      setKpis(res.kpis || null)
      setAmounts(res.amounts || null)
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'No se pudieron cargar los comprobantes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast, filters.page, filters.limit, filters.kpiFilter, filters.dateFrom, filters.dateTo])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  useEffect(() => {
    if (selectedPayment && payments.length) {
      const updated = payments.find((p) => p._id === selectedPayment._id)
      if (updated) setSelectedPayment(updated)
    }
  }, [payments])

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range)
    setFilters((f) => ({
      ...f,
      dateFrom: format(range.from, 'yyyy-MM-dd'),
      dateTo: format(range.to, 'yyyy-MM-dd'),
      page: 1,
    }))
  }

  const handleSelectPayment = (p: RequestPayment) => {
    setSelectedPayment(p)
  }

  const handleAutoMatch = async (id: string) => {
    setAutoMatchingId(id)
    try {
      const res = await requestPaymentsService.autoMatch(id)
      if (res.matched && res.orderId) {
        toast({
          title: 'Auto-match exitoso',
          description: res.message || `Asociado a orden #${res.orderNumber}`,
        })
        loadPayments()
        if (selectedPayment?._id === id && res.data) {
          setSelectedPayment(res.data)
        }
      } else {
        toast({
          title: 'Sin coincidencias',
          description: res.message || 'No se encontró orden con teléfono y monto coincidentes',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Error en auto-match',
        variant: 'destructive',
      })
    } finally {
      setAutoMatchingId(null)
    }
  }

  const handleAssociateOrders = async (id: string, orderIds: string[]) => {
    setUpdatingId(id)
    try {
      const res = await requestPaymentsService.update(id, { orderIds })
      toast({ title: 'Éxito', description: 'Órdenes asociadas correctamente', duration: 1500 })
      loadPayments()
      if (selectedPayment?._id === id) {
        setSelectedPayment(res.data)
      }
      setOrderSelectorOpen(false)
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'No se pudieron asociar las órdenes',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdateStatus = async (id: string, status: RequestPaymentStatus) => {
    setUpdatingId(id)
    try {
      const res = await requestPaymentsService.update(id, { status })
      toast({ title: 'Éxito', description: 'Estado actualizado', duration: 1500 })
      loadPayments()
      if (selectedPayment?._id === id) {
        setSelectedPayment(res.data)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleConfirmPayment = async (id: string) => {
    setUpdatingId(id)
    try {
      const res = await requestPaymentsService.confirmPayment(id)
      toast({ title: 'Éxito', description: 'Pago confirmado. Request y órdenes actualizados.', duration: 1500 })
      loadPayments()
      if (selectedPayment?._id === id) {
        setSelectedPayment(res.data)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'No se pudo confirmar el pago',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleOrderSelect = (order: UserOrder) => {
    if (!selectedPayment) return
    const currentIds = selectedPayment.orderIds || []
    const newIds = currentIds.includes(order._id) ? currentIds : [...currentIds, order._id]
    handleAssociateOrders(selectedPayment._id, newIds)
  }

  const handleDisassociateOrder = async (orderId: string) => {
    if (!selectedPayment) return
    setUpdatingId(selectedPayment._id)
    try {
      const res = await requestPaymentsService.disassociateOrder(
        selectedPayment._id,
        orderId
      )
      toast({ title: 'Éxito', description: 'Orden desasociada correctamente', duration: 1500 })
      loadPayments()
      setSelectedPayment(res.data)
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'No se pudo desasociar la orden',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // La API devuelve datos ya filtrados por kpiFilter; dividimos en columnas para la UI
  const pendientesPago = payments.filter(isPendientePago)
  const pagoRecibido = payments.filter(isPagoRecibido)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative z-10 p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-5">
          {/* Header */}
          <header className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                      Comprobantes de Pago
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Procesa y asocia comprobantes a órdenes del CRM
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 bg-card border-border min-w-[180px] justify-start"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {dateRange?.from
                          ? dateRange.from.getTime() === dateRange.to?.getTime()
                            ? format(dateRange.from, 'd MMM yyyy', { locale: es })
                            : `${format(dateRange.from, 'd MMM', { locale: es })} - ${format(dateRange.to!, 'd MMM yyyy', { locale: es })}`
                          : 'Seleccionar fechas'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="flex">
                      <div className="flex flex-col gap-1 p-2 border-r border-border">
                        {DATE_PRESETS.map((p) => (
                          <Button
                            key={p.label}
                            variant="ghost"
                            size="sm"
                            className="justify-start text-xs"
                            onClick={() => handleDateRangeChange(p.getRange())}
                          >
                            {p.label}
                          </Button>
                        ))}
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-xs text-muted-foreground"
                          onClick={() => {
                            setDateRange(null)
                            setFilters((f) => ({ ...f, dateFrom: '', dateTo: '', page: 1 }))
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from ?? new Date()}
                        selected={
                          dateRange
                            ? { from: dateRange.from, to: dateRange.to }
                            : undefined
                        }
                        onSelect={(r) => {
                          if (r?.from) {
                            const to = r.to ?? r.from
                            handleDateRangeChange({ from: r.from, to })
                          }
                        }}
                        numberOfMonths={2}
                        locale={es}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select
                      value={String(filters.limit)}
                      onValueChange={(v) => setFilters((f) => ({ ...f, limit: Number(v), page: 1 }))}
                    >
                      <SelectTrigger className="w-[80px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>Comprobantes por página</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={loadPayments}
                      disabled={loading}
                    >
                      <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Actualizar lista</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap items-center gap-2">
              {KPI_FILTER_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <Button
                    key={opt.value}
                    variant={filters.kpiFilter === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setFilters((f) => ({ ...f, kpiFilter: opt.value, page: 1 }))}
                  >
                    <Icon className="h-3 w-3 mr-1.5" />
                    {opt.label}
                  </Button>
                )
              })}
            </div>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              title="Total comprobantes"
              value={kpis?.total ?? pagination?.total ?? payments.length}
              icon={<Receipt className="h-4 w-4 text-foreground" />}
              description="Cantidad total de comprobantes en el período seleccionado"
              accentColor="bg-muted"
              onClick={() => setFilters((f) => ({ ...f, kpiFilter: 'all', page: 1 }))}
              isActive={filters.kpiFilter === 'all'}
            />
            <KpiCard
              title="Sin asociar"
              value={kpis?.sinAsociar ?? payments.filter((p) => !p.orderIds?.length).length}
              icon={<Link2 className="h-4 w-4 text-orange-400" />}
              description="Comprobantes que aún no tienen órdenes asociadas"
              accentColor="bg-orange-500/20"
              percentage={
                (kpis?.total ?? payments.length) > 0
                  ? ((kpis?.sinAsociar ?? 0) / (kpis?.total ?? payments.length)) * 100
                  : 0
              }
              onClick={() => setFilters((f) => ({ ...f, kpiFilter: 'sinAsociar', page: 1 }))}
              isActive={filters.kpiFilter === 'sinAsociar'}
            />
            <KpiCard
              title="Pendientes confirmar"
              value={kpis?.pendientes ?? payments.filter(isAsociadoPendiente).length}
              icon={<Clock className="h-4 w-4 text-amber-400" />}
              description="Asociados a órdenes pero pendientes de confirmar el pago"
              accentColor="bg-amber-500/20"
              percentage={
                (kpis?.total ?? payments.length) > 0
                  ? ((kpis?.pendientes ?? 0) / (kpis?.total ?? payments.length)) * 100
                  : 0
              }
              onClick={() => setFilters((f) => ({ ...f, kpiFilter: 'pendientes', page: 1 }))}
              isActive={filters.kpiFilter === 'pendientes'}
            />
            <KpiCard
              title="Pago recibido"
              value={kpis?.pagoRecibido ?? payments.filter(isPagoRecibido).length}
              icon={<Banknote className="h-4 w-4 text-emerald-400" />}
              description="Comprobantes con pago confirmado y procesado"
              accentColor="bg-emerald-500/20"
              percentage={
                (kpis?.total ?? payments.length) > 0
                  ? ((kpis?.pagoRecibido ?? 0) / (kpis?.total ?? payments.length)) * 100
                  : 0
              }
              onClick={() => setFilters((f) => ({ ...f, kpiFilter: 'pagoRecibido', page: 1 }))}
              isActive={filters.kpiFilter === 'pagoRecibido'}
            />
          </div>

          {/* Amount summary */}
          <Card className="bg-card/50">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Monto total:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        amounts?.total ??
                          payments.reduce((acc, p) => acc + (p.aiResult?.data?.amount || 0), 0)
                      )}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confirmado:</span>
                    <span className="font-semibold text-emerald-500">
                      {formatCurrency(
                        amounts?.confirmed ??
                          pagoRecibido.reduce((acc, p) => acc + (p.aiResult?.data?.amount || 0), 0)
                      )}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Pendiente:</span>
                    <span className="font-semibold text-amber-500">
                      {formatCurrency(
                        amounts?.pending ??
                          (payments.reduce((acc, p) => acc + (p.aiResult?.data?.amount || 0), 0) -
                            pagoRecibido.reduce((acc, p) => acc + (p.aiResult?.data?.amount || 0), 0))
                      )}
                    </span>
                  </div>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Actualizando...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Column 1: Pending payments */}
            <Card className="overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-border bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <CardTitle className="text-sm font-semibold">Pendientes de pago</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {pendientesPago.length}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                  Sin asociar, o asociados pendientes de confirmar
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-3 space-y-2 min-h-[400px] max-h-[calc(100vh-480px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendientesPago.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted mb-3">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-muted-foreground">Todo al día</p>
                    <p className="text-xs text-muted-foreground mt-1">No hay comprobantes pendientes</p>
                  </div>
                ) : (
                  pendientesPago.map((pr) => (
                    <PaymentCard
                      key={pr._id}
                      pr={pr}
                      isSelected={selectedPayment?._id === pr._id}
                      onSelect={() => handleSelectPayment(pr)}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Column 2: Received payments */}
            <Card className="overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-border bg-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-400" />
                    <CardTitle className="text-sm font-semibold">Pago recibido</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {pagoRecibido.length}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                  Asociados y confirmados correctamente
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-3 space-y-2 min-h-[400px] max-h-[calc(100vh-480px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pagoRecibido.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted mb-3">
                      <Banknote className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-muted-foreground">Sin pagos confirmados</p>
                    <p className="text-xs text-muted-foreground mt-1">Confirma pagos desde la columna izquierda</p>
                  </div>
                ) : (
                  pagoRecibido.map((pr) => (
                    <PaymentCard
                      key={pr._id}
                      pr={pr}
                      isSelected={selectedPayment?._id === pr._id}
                      onSelect={() => handleSelectPayment(pr)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 text-xs text-muted-foreground border-t border-border/50">
              <span>
                {Math.min((pagination.page - 1) * filters.limit + 1, pagination.total)}–
                {Math.min(pagination.page * filters.limit, pagination.total)} de {pagination.total}
              </span>
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!pagination.hasPrev}
                      onClick={() => setFilters((f) => ({ ...f, page: 1 }))}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <ChevronLeft className="h-3.5 w-3.5 -ml-1.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Primera</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!pagination.hasPrev}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Anterior</TooltipContent>
                </Tooltip>
                <span className="min-w-[3.5rem] text-center text-foreground font-medium tabular-nums">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!pagination.hasNext}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Siguiente</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!pagination.hasNext}
                      onClick={() => setFilters((f) => ({ ...f, page: pagination.totalPages }))}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      <ChevronRight className="h-3.5 w-3.5 -ml-1.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Última</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedPayment && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Detalle del comprobante
                </SheetTitle>
                <SheetDescription>
                  Información completa y acciones disponibles
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status and date header */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedPayment.status} showIcon />
                  {selectedPayment.date && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {format(new Date(selectedPayment.date), 'd MMM yyyy, HH:mm', { locale: es })}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatDistanceToNow(new Date(selectedPayment.date), { addSuffix: true, locale: es })}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Receipt image */}
                {selectedPayment.attachment?.link && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Comprobante adjunto
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={selectedPayment.attachment.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                        >
                          <img
                            src={selectedPayment.attachment.link}
                            alt="Comprobante"
                            className="w-full max-h-64 object-contain bg-muted"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Click para abrir en nueva pestaña</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {/* AI Data */}
                {selectedPayment.aiResult?.data && (
                  <Card>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Datos extraídos (IA)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Información detectada automáticamente del comprobante
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 pb-4">
                      <div className="grid gap-3 text-sm">
                        {selectedPayment.aiResult.data.amount != null && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Banknote className="h-3.5 w-3.5" />
                              Monto
                            </span>
                            <span className="font-semibold text-lg">
                              {formatCurrency(selectedPayment.aiResult.data.amount)}
                            </span>
                          </div>
                        )}
                        {selectedPayment.aiResult.data.date && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              Fecha
                            </span>
                            <span>{selectedPayment.aiResult.data.date}</span>
                          </div>
                        )}
                        {selectedPayment.aiResult.data.time && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Hora
                            </span>
                            <span>{selectedPayment.aiResult.data.time}</span>
                          </div>
                        )}
                        {selectedPayment.aiResult.data.sender?.name && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              Remitente
                            </span>
                            <span>{selectedPayment.aiResult.data.sender.name}</span>
                          </div>
                        )}
                        {selectedPayment.aiResult.data.sender?.platform && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5" />
                              Plataforma
                            </span>
                            <Badge variant="outline">{selectedPayment.aiResult.data.sender.platform}</Badge>
                          </div>
                        )}
                        {selectedPayment.contactPhone && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              Teléfono
                            </span>
                            <span>{selectedPayment.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Confirm payment action */}
                {selectedPayment.orderIds &&
                  selectedPayment.orderIds.length > 0 &&
                  isPendientePago(selectedPayment) &&
                  selectedPayment.status !== 'cancelada' && (
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-emerald-400">
                              Orden asociada - Pendiente de confirmar
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Confirma que el pago fue recibido correctamente para actualizar el estado de la orden.
                            </p>
                            <Button
                              onClick={() => handleConfirmPayment(selectedPayment._id)}
                              disabled={updatingId === selectedPayment._id}
                              className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                            >
                              {updatingId === selectedPayment._id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                              )}
                              Confirmar pago recibido
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Actions */}
                {(() => {
                  const hasOrders = (selectedPayment.orderIds?.length ?? 0) > 0
                  const canAutoMatch = !hasOrders
                  const canAssociateOrder = !hasOrders
                  const currentStatus = selectedPayment.status
                  const allowedStatuses = (['pending', 'nueva', 'pagoRecibido', 'cancelada'] as const)
                  const statusOptions = [
                    ...allowedStatuses,
                    ...(['empaquetada', 'archivada'] as const).filter(
                      (s) => s === currentStatus
                    ),
                  ]
                  return (
                    <Card>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm">Acciones</CardTitle>
                        <CardDescription className="text-xs">
                          Gestiona el comprobante y sus asociaciones
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4">
                        <div className="flex flex-wrap gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => handleAutoMatch(selectedPayment._id)}
                                disabled={!!autoMatchingId || !canAutoMatch}
                                variant="outline"
                              >
                                {autoMatchingId === selectedPayment._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Zap className="h-4 w-4 mr-2" />
                                )}
                                Auto-match
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canAutoMatch
                                ? 'Busca automáticamente una orden con monto y teléfono coincidentes'
                                : 'Ya tiene órdenes asociadas'}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setOrderSelectorOpen(true)}
                                disabled={!canAssociateOrder}
                              >
                                <Link2 className="h-4 w-4 mr-2" />
                                Asociar orden
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canAssociateOrder
                                ? 'Selecciona manualmente una orden para asociar'
                                : 'Ya tiene órdenes asociadas'}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Select
                                  value={selectedPayment.status}
                                  onValueChange={(v) => {
                                    const status = v as RequestPaymentStatus
                                    if (status === 'pagoRecibido' && hasOrders) {
                                      handleConfirmPayment(selectedPayment._id)
                                    } else {
                                      handleUpdateStatus(selectedPayment._id, status)
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((s) => (
                                      <SelectItem
                                        key={s}
                                        value={s}
                                        disabled={
                                          (s === 'pagoRecibido' && !hasOrders) ||
                                          s === 'empaquetada' ||
                                          s === 'archivada'
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          {STATUS_ICONS[s]}
                                          {STATUS_LABELS[s]}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Cambiar estado del comprobante</TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })()}

                {/* Associated orders */}
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Órdenes asociadas
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedPayment.orders && selectedPayment.orders.length > 0
                        ? `${selectedPayment.orders.length} orden${selectedPayment.orders.length !== 1 ? 'es' : ''} vinculada${selectedPayment.orders.length !== 1 ? 's' : ''}`
                        : 'Sin órdenes asociadas'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    {selectedPayment.orders && selectedPayment.orders.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPayment.orders.map((order: UserOrder) => {
                          const canDisassociate =
                            selectedPayment.status !== 'pagoRecibido' &&
                            order.status !== 'pagoRecibido'
                          return (
                            <div
                              key={order._id}
                              className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    href={`/?openOrder=${order._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-90 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold">Orden #{order.numberOrder}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {[order.infoEntrega?.name, order.infoEntrega?.apellido]
                                        .filter(Boolean)
                                        .join(' ') || '-'}
                                    </span>
                                    <span>·</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(order.total)}
                                    </span>
                                  </div>
                                </div>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>Abrir orden en Órdenes (nueva pestaña)</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDisassociateOrder(order._id)}
                                    disabled={
                                      updatingId === selectedPayment._id || !canDisassociate
                                    }
                                  >
                                    <Link2 className="h-4 w-4 mr-1.5 rotate-45" />
                                    Desasociar
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {canDisassociate
                                    ? 'Quitar la asociación con esta orden'
                                    : 'No se puede desasociar: pago ya confirmado'}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="p-3 rounded-full bg-muted mx-auto w-fit mb-3">
                          <Link2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No hay órdenes asociadas
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Usa <strong>Auto-match</strong> para buscar automáticamente o{' '}
                          <strong>Asociar orden</strong> manualmente
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Order selector */}
      <OrderSelector
        open={orderSelectorOpen}
        onOpenChange={setOrderSelectorOpen}
        onSelect={handleOrderSelect}
        excludeIds={selectedPayment?.orderIds || []}
        amountHint={selectedPayment?.aiResult?.data?.amount}
        phoneHint={selectedPayment?.contactPhone}
      />
    </div>
    </TooltipProvider>
  )
}
