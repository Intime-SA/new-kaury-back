import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, X, Download } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { setSelectedDate } from "@/store/slices/ordersSlice"
import { OrdersKPIs } from "../kpis/orders-kpis"
import * as XLSX from 'xlsx'
import { OrderActions } from "./table-actions"
import { useOrderStateManagement } from "@/hooks/orders/useOrderStateManagement"
import { OrdersStatusTabs } from "../tabs/orders-tabs"

interface TableHeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  reports: any
  loading: boolean
  ordersCount?: {
    nueva: number
    empaquetada: number
    pagoRecibido: number
    enviada: number
    cancelada: number
    archivada: number
  }
}

export function TableHeader({ searchTerm, setSearchTerm, reports, loading, ordersCount }: TableHeaderProps) {
  const dispatch = useDispatch()
  const { selectedDate, selectedOrders } = useSelector((state: RootState) => state.orders)

  const { 
    handleBulkOrderAction, 
    getBulkOrderActions,
    selectedOrdersCount 
  } = useOrderStateManagement({ selectedOrders });

  // Verificar si todas las órdenes seleccionadas tienen el mismo estado
  const allSameStatus = selectedOrders.length > 0 && 
    selectedOrders.every(order => order.status === selectedOrders[0].status);

  const bulkActions = allSameStatus ? getBulkOrderActions(selectedOrders[0].status) : [];

  const handleDownloadExcel = () => {
    if (selectedOrders.length === 0) return

    // Encontrar el máximo número de productos en una orden
    const maxProducts = Math.max(...selectedOrders.map(order => order.orderItems.length))

    // Crear headers base
    const baseHeaders = [
      'ID', 'Número de Orden', 'Fecha', 'Cliente', 'Email', 'Teléfono',
      'Dirección', 'Ciudad', 'Provincia', 'Código Postal', 'Total',
      'Estado', 'Canal de Venta', 'Tipo de Envío'
    ]

    // Agregar headers para productos
    const productHeaders = Array.from({ length: maxProducts }, (_, i) => [
      `Producto ${i + 1}`,
      `Cantidad ${i + 1}`,
      `Precio Unit. ${i + 1}`,
      `Subtotal ${i + 1}`
    ]).flat()

    const headers = [...baseHeaders, ...productHeaders]

    // Preparar los datos
    const rows = selectedOrders.map(order => {
      const baseData = [
        order.id,
        order.numberOrder,
        new Date(order.date._seconds * 1000).toLocaleDateString(),
        `${order.infoEntrega.name} ${order.infoEntrega.apellido}`,
        order.infoEntrega.email,
        order.infoEntrega.telefono,
        `${order.infoEntrega.calle} ${order.infoEntrega.numero}${order.infoEntrega.pisoDpto ? ` ${order.infoEntrega.pisoDpto}` : ''}`,
        order.infoEntrega.ciudad,
        order.infoEntrega.estado,
        order.infoEntrega.codigoPostal,
        order.total,
        order.status,
        order.canalVenta,
        order.envioSeleccionado
      ]

      // Preparar datos de productos
      const productsData = Array(maxProducts * 4).fill('')
      order.orderItems.forEach((item, index) => {
        const baseIndex = index * 4
        productsData[baseIndex] = item.name
        productsData[baseIndex + 1] = item.quantity
        productsData[baseIndex + 2] = item.unit_price
        productsData[baseIndex + 3] = item.quantity * item.unit_price
      })

      return [...baseData, ...productsData]
    })

    // Crear workbook y worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

    // Aplicar estilos y formato
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    
    // Configurar anchos de columna
    const columnWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }))
    ws['!cols'] = columnWidths

    // Agregar bordes a las columnas de subtotal
    const style = {
      border: {
        right: {
          style: 'medium',
          color: { rgb: "666666" }
        }
      }
    }

    // Aplicar bordes a cada columna de subtotal
    for (let col = baseHeaders.length + 3; col < headers.length; col += 4) {
      for (let row = 0; row <= range.e.r; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cellRef]) ws[cellRef] = { v: '', s: style }
        else ws[cellRef].s = style
      }
    }

    // Estilo para los headers
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E9E9E9" } },
      alignment: { horizontal: 'center' }
    }

    // Aplicar estilo a los headers
    for (let col = 0; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!ws[cellRef]) ws[cellRef] = { v: '', s: headerStyle }
      else ws[cellRef].s = headerStyle
    }

    // Crear el archivo Excel
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Órdenes')

    // Guardar el archivo
    XLSX.writeFile(wb, `ordenes_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Detectar si la fecha seleccionada es hoy (para el subtítulo)
  const isToday = (() => {
    if (!selectedDate) return false
    const sel = new Date(selectedDate)
    const today = new Date()
    return (
      sel.getFullYear() === today.getFullYear() &&
      sel.getMonth() === today.getMonth() &&
      sel.getDate() === today.getDate()
    )
  })()

  return (
    <div className="flex-none space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Órdenes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {!selectedDate
              ? "Resumen general (sin filtro de fecha)"
              : isToday
              ? "Operación de hoy en tiempo real"
              : `Filtrado por ${format(new Date(selectedDate), "PPP", { locale: es })}`}
          </p>
        </div>
        {ordersCount && (
          <OrdersStatusTabs orders={ordersCount} className="ml-auto max-w-full" />
        )}
      </div>

      <OrdersKPIs
        reports={reports}
        loading={loading}
        hasDateFilter={!!selectedDate}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 w-[200px] justify-start text-left font-normal gap-2",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="h-4 w-4" />
                {selectedDate ? (
                  isToday ? (
                    <span className="font-medium">Hoy · {format(new Date(selectedDate), "d MMM", { locale: es })}</span>
                  ) : (
                    format(new Date(selectedDate), "PPP", { locale: es })
                  )
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate ? new Date(selectedDate) : undefined}
                  onSelect={(date) => {
                    const event = {
                      target: {
                        value: date ? date.toISOString() : "",
                      },
                    }
                    dispatch(setSelectedDate(event.target.value))
                  }}
                  initialFocus
                />
                <div className="flex justify-between items-center gap-1 p-2 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      dispatch(setSelectedDate(today.toISOString()))
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Hoy
                  </Button>
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(setSelectedDate(""))}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {selectedOrders.length > 0 && (
            <OrderActions
              actions={bulkActions}
              onActionClick={handleBulkOrderAction}
              variant="inline"
              selectedCount={selectedOrdersCount}
            />
          )}
        </div>

        <div className="flex flex-1 sm:justify-end items-center gap-2">
          <div className="relative w-full sm:w-[260px]">
            <Input
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pr-9"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Limpiar"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                onClick={() => {
                  setSearchTerm("")
                  dispatch(setSelectedDate(""))
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadExcel}
            disabled={selectedOrders.length === 0}
            className="h-9 gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
            {selectedOrders.length > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-brand px-1.5 text-[10px] font-semibold text-white">
                {selectedOrders.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}