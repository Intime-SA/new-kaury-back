'use client'

import React from "react"
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  BarChart3,
  Eye,
  MousePointer,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

// Hook real de reportes
import { useReports } from '@/hooks/reports/useReports'
import { useEventsReports } from '@/hooks/reports/useEventsReports'
import type { ReportsData, EventsData, ReportDataPoint } from '@/services/reports'

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CHART_COLORS = {
  orders: '#3b82f6',
  sales: '#10b981',
  cancel: '#ef4444',
  amount: '#8b5cf6',
  // Colores para eventos
  visits: '#06b6d4',
  viewProduct: '#8b5cf6',
  addToCart: '#f59e0b',
  createOrder: '#10b981',
  purchase: '#3b82f6',
  totalEvents: '#6366f1',
} as const

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

const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00')
  return format(date, 'd MMM', { locale: es })
}

const calculateTotals = (data: ReportsData) => {
  const sumY = (arr: ReportDataPoint[]) => arr.reduce((acc, point) => acc + point.y, 0)

  return {
    totalOrders: sumY(data.totalOrders),
    totalSales: sumY(data.totalSales),
    totalCancel: sumY(data.totalCancel),
    totalAmount: sumY(data.totalAmount),
  }
}

const calculateEventsTotals = (data: EventsData) => {
  const sumY = (arr: ReportDataPoint[]) => arr.reduce((acc, point) => acc + point.y, 0)
  const avgY = (arr: ReportDataPoint[]) => arr.length > 0 ? arr.reduce((acc, point) => acc + point.y, 0) / arr.length : 0

  return {
    visitsCount: sumY(data.visitsCount),
    visitsValue: sumY(data.visitsValue),
    viewProductCount: sumY(data.viewProductCount),
    viewProductValue: sumY(data.viewProductValue),
    addToCartCount: sumY(data.addToCartCount),
    addToCartValue: sumY(data.addToCartValue),
    createOrderCount: sumY(data.createOrderCount),
    createOrderValue: sumY(data.createOrderValue),
    purchaseCount: sumY(data.purchaseCount),
    purchaseValue: sumY(data.purchaseValue),
    totalEvents: sumY(data.totalEvents),
    conversionRate: avgY(data.conversionRate), // Promedio de la tasa de conversión
  }
}

const transformDataForChart = (data: ReportsData) => {
  return data.totalOrders.map((point, index) => ({
    name: formatChartDate(point.x),
    date: point.x,
    orders: point.y,
    sales: data.totalSales[index]?.y ?? 0,
    cancel: data.totalCancel[index]?.y ?? 0,
    amount: data.totalAmount[index]?.y ?? 0,
  }))
}

const transformEventsDataForChart = (data: EventsData) => {
  return data.visitsCount.map((point, index) => ({
    name: formatChartDate(point.x),
    date: point.x,
    visitsCount: point.y,
    visitsValue: data.visitsValue[index]?.y ?? 0,
    viewProductCount: data.viewProductCount[index]?.y ?? 0,
    viewProductValue: data.viewProductValue[index]?.y ?? 0,
    addToCartCount: data.addToCartCount[index]?.y ?? 0,
    addToCartValue: data.addToCartValue[index]?.y ?? 0,
    createOrderCount: data.createOrderCount[index]?.y ?? 0,
    createOrderValue: data.createOrderValue[index]?.y ?? 0,
    purchaseCount: data.purchaseCount[index]?.y ?? 0,
    purchaseValue: data.purchaseValue[index]?.y ?? 0,
    totalEvents: data.totalEvents[index]?.y ?? 0,
    conversionRate: data.conversionRate[index]?.y ?? 0,
  }))
}

// ============================================================================
// COMPONENTES
// ============================================================================

interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const presets = [
    { label: 'Hoy', range: { from: new Date(), to: new Date() } },
    { label: 'Últimos 7 días', range: { from: subDays(new Date(), 6), to: new Date() } },
    { label: 'Últimos 30 días', range: { from: subDays(new Date(), 29), to: new Date() } },
    { label: 'Este mes', range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-10 justify-start text-left font-normal bg-secondary/50 border-border hover:bg-secondary hover:border-muted-foreground/30 transition-all duration-200',
            !dateRange && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {dateRange?.from ? (
            dateRange.to ? (
              <span className="text-foreground">
                {format(dateRange.from, 'd MMM', { locale: es })} -{' '}
                {format(dateRange.to, 'd MMM yyyy', { locale: es })}
              </span>
            ) : (
              <span className="text-foreground">
                {format(dateRange.from, 'd MMM yyyy', { locale: es })}
              </span>
            )
          ) : (
            <span>Seleccionar fechas</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
        <div className="flex">
          <div className="flex flex-col gap-1 p-3 border-r border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Presets</p>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start text-sm font-normal hover:bg-secondary"
                onClick={() => {
                  onDateRangeChange(preset.range)
                  setIsOpen(false)
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ from: range.from, to: range.to })
                } else if (range?.from) {
                  onDateRangeChange({ from: range.from, to: range.from })
                }
              }}
              numberOfMonths={2}
              locale={es}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: number
  color: string
  delay?: number
}

function MetricCard({ title, value, subtitle, icon, trend, color, delay = 0 }: MetricCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 transition-all duration-300 hover:border-muted-foreground/30 hover:shadow-lg hover:shadow-black/20 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {trend >= 0 ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={cn('text-sm font-medium', trend >= 0 ? 'text-emerald-500' : 'text-red-500')}>
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-muted-foreground">vs período anterior</span>
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 h-1 w-full opacity-50"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {entry.dataKey === 'amount'
              ? formatCurrency(entry.value)
              : entry.dataKey === 'conversionRate'
              ? `${entry.value.toFixed(1)}%`
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

interface ChartCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  delay?: number
}

function ChartCard({ title, subtitle, children, delay = 0 }: ChartCardProps) {
  return (
    <div
      className="rounded-xl bg-card border border-border p-6 transition-all duration-300 hover:border-muted-foreground/30 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-[320px]">{children}</div>
    </div>
  )
}

function EventsMetricsCards({ totals, delay = 0 }: { totals: any, delay?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Visitas"
        value={totals?.visitsCount.toLocaleString() ?? 0}
        subtitle="Total del período"
        icon={<MousePointer className="h-6 w-6" />}
        color={CHART_COLORS.visits}
        delay={delay}
      />
      <MetricCard
        title="Visualizaciones"
        value={totals?.viewProductCount.toLocaleString() ?? 0}
        subtitle="Productos vistos"
        icon={<Eye className="h-6 w-6" />}
        color={CHART_COLORS.viewProduct}
        delay={delay + 50}
      />
      <MetricCard
        title="Agregados al Carrito"
        value={totals?.addToCartCount.toLocaleString() ?? 0}
        subtitle="Productos en carrito"
        icon={<ShoppingCart className="h-6 w-6" />}
        color={CHART_COLORS.addToCart}
        delay={delay + 100}
      />
      <MetricCard
        title="Tasa de Conversión"
        value={`${(totals?.conversionRate ?? 0).toFixed(1)}%`}
        subtitle="Promedio del período"
        icon={<TrendingUp className="h-6 w-6" />}
        color={CHART_COLORS.purchase}
        delay={delay + 150}
      />
    </div>
  )
}

function EventsCharts({ chartData, delay = 0 }: { chartData: any[], delay?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard
        title="Métricas de Visitas y Visualizaciones"
        subtitle="Evolución de visitas y productos visualizados"
        delay={delay}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.visits} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.visits} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="viewProductGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.viewProduct} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.viewProduct} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="visitsCount"
              name="Visitas"
              stroke={CHART_COLORS.visits}
              strokeWidth={2}
              fill="url(#visitsGradient)"
            />
            <Area
              type="monotone"
              dataKey="viewProductCount"
              name="Visualizaciones"
              stroke={CHART_COLORS.viewProduct}
              strokeWidth={2}
              fill="url(#viewProductGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Tasa de Conversión"
        subtitle="Porcentaje de conversión por día"
        delay={delay + 50}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="conversionRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.purchase} stopOpacity={0.9} />
                <stop offset="95%" stopColor={CHART_COLORS.purchase} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="conversionRate"
              name="Tasa de Conversión"
              fill="url(#conversionRateGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="h-10 w-64 rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-6">
              <div className="space-y-2 mb-6">
                <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-[320px] rounded-lg bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function ReportsPage() {
  // Estado compartido de filtros para ambos hooks
  const [sharedFilters, setSharedFilters] = React.useState({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  })

  // Hook para órdenes usando filtros compartidos
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useReports(sharedFilters)

  // Hook para eventos usando filtros compartidos
  const {
    data: eventsData,
    isLoading: eventsIsLoading,
    isFetching: eventsIsFetching,
    isError: eventsIsError,
    error: eventsError,
    refetch: eventsRefetch,
  } = useEventsReports(sharedFilters)

  // Adaptar filtros al formato del DateRangePicker
  const dateRange: DateRange = {
    from: sharedFilters.startDate,
    to: sharedFilters.endDate,
  }

  // Handler para cambio de fechas - actualiza estado compartido
  const handleDateRangeChange = (range: DateRange) => {
    setSharedFilters({
      startDate: range.from,
      endDate: range.to,
    })
  }

  // Transformar datos para las gráficas
  const chartData = data ? transformDataForChart(data) : []
  const totals = data ? calculateTotals(data) : null

  // Datos de eventos
  const eventsChartData = eventsData ? transformEventsDataForChart(eventsData) : []
  const eventsTotals = eventsData ? calculateEventsTotals(eventsData) : null

  // Estado de carga combinado
  const isAnyLoading = isLoading || eventsIsLoading
  const isAnyFetching = isFetching || eventsIsFetching
  const isAnyError = isError || eventsIsError
  const combinedError = error || eventsError

  // Refetch combinado
  const handleRefetch = () => {
    refetch()
    eventsRefetch()
  }

  // Estado de carga
  if (isAnyLoading) {
    return <LoadingSkeleton />
  }

  // Estado de error
  if (isAnyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Error al cargar reportes</h2>
          <p className="text-muted-foreground max-w-md">
            {combinedError?.message || 'Ocurrió un error inesperado al cargar los datos.'}
          </p>
          <Button onClick={handleRefetch} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }


  // Render principal con datos
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Reportes</h1>
                {isAnyFetching && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Actualizando...</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Análisis de rendimiento y métricas de ventas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                disabled={isAnyFetching}
                className="bg-secondary/50 border-border hover:bg-secondary hover:border-muted-foreground/30"
              >
                <RefreshCw className={cn('h-4 w-4', isAnyFetching && 'animate-spin')} />
              </Button>
            </div>
          </header>

          {/* Tabs para Órdenes vs Eventos */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Órdenes
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Eventos
              </TabsTrigger>
            </TabsList>

            {/* Contenido de Órdenes */}
            <TabsContent value="orders" className="space-y-6">
              {!data || chartData.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No hay datos de órdenes</h3>
                    <p className="text-muted-foreground max-w-md">
                      No se encontraron datos de órdenes para el rango de fechas seleccionado.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Metric Cards Órdenes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Órdenes Totales"
                  value={totals?.totalOrders.toLocaleString() ?? 0}
                  subtitle="Total del período"
                  icon={<ShoppingCart className="h-6 w-6" />}
                  color={CHART_COLORS.orders}
                  delay={100}
                />
                <MetricCard
                  title="Ventas Completadas"
                  value={totals?.totalSales.toLocaleString() ?? 0}
                  subtitle="Órdenes exitosas"
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  color={CHART_COLORS.sales}
                  delay={150}
                />
                <MetricCard
                  title="Cancelaciones"
                  value={totals?.totalCancel.toLocaleString() ?? 0}
                  subtitle="Órdenes canceladas"
                  icon={<XCircle className="h-6 w-6" />}
                  color={CHART_COLORS.cancel}
                  delay={200}
                />
                <MetricCard
                  title="Ingresos Totales"
                  value={formatCurrency(totals?.totalAmount ?? 0)}
                  subtitle={formatCompactNumber(totals?.totalAmount ?? 0)}
                  icon={<DollarSign className="h-6 w-6" />}
                  color={CHART_COLORS.amount}
                  delay={250}
                />
              </div>

              {/* Charts Órdenes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Métricas de Órdenes"
                  subtitle="Evolución de órdenes, ventas y cancelaciones"
                  delay={300}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.orders} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CHART_COLORS.orders} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.sales} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CHART_COLORS.sales} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCompactNumber(value)}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        name="Órdenes"
                        stroke={CHART_COLORS.orders}
                        strokeWidth={2}
                        fill="url(#ordersGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        name="Ventas"
                        stroke={CHART_COLORS.sales}
                        strokeWidth={2}
                        fill="url(#salesGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="cancel"
                        name="Cancelaciones"
                        stroke={CHART_COLORS.cancel}
                        strokeWidth={2}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Ingresos Diarios"
                  subtitle="Monto total de ventas por día"
                  delay={350}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.amount} stopOpacity={0.9} />
                          <stop offset="95%" stopColor={CHART_COLORS.amount} stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCompactNumber(value)}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="amount"
                        name="Ingresos"
                        fill="url(#amountGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Summary Stats Órdenes */}
              <div
                className="rounded-xl bg-card border border-border p-6 animate-fade-up"
                style={{ animationDelay: '400ms' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-foreground">Resumen del Período</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {totals && totals.totalOrders > 0
                        ? ((totals.totalSales / totals.totalOrders) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {totals && totals.totalSales > 0
                        ? formatCurrency(totals.totalAmount / totals.totalSales)
                        : '$0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Órdenes/Día</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {totals && chartData.length > 0
                        ? Math.round(totals.totalOrders / chartData.length)
                        : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingresos/Día</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {totals && chartData.length > 0
                        ? formatCurrency(totals.totalAmount / chartData.length)
                        : '$0'}
                    </p>
                  </div>
                </div>
              </div>
                </>
              )}
            </TabsContent>

            {/* Contenido de Eventos */}
            <TabsContent value="events" className="space-y-6">
              {!eventsData || eventsChartData.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Activity className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No hay datos de eventos</h3>
                    <p className="text-muted-foreground max-w-md">
                      No se encontraron datos de eventos para el rango de fechas seleccionado.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Metric Cards Eventos */}
                  <EventsMetricsCards totals={eventsTotals} delay={100} />

              {/* Charts Eventos */}
              <EventsCharts chartData={eventsChartData} delay={300} />

              {/* Summary Stats Eventos */}
              {/* <EventsSummary totals={eventsTotals} chartData={eventsChartData} /> */}
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground pb-8">
            <p>
              Datos del {format(sharedFilters.startDate, 'd MMM yyyy', { locale: es })} al{' '}
              {format(sharedFilters.endDate, 'd MMM yyyy', { locale: es })}
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
