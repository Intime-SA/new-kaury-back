import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, X, Download } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/app/store/store"
import { setSelectedDate } from "@/app/store/slices/ordersSlice"
import { OrdersKPIs } from "../kpis/orders-kpis"
import * as XLSX from 'xlsx'
import { OrderActions } from "./table-actions"
import { useOrderStateManagement } from "@/hooks/useOrderStateManagement"

interface TableHeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  reports: any
  loading: boolean
}

export function TableHeader({ searchTerm, setSearchTerm, reports, loading }: TableHeaderProps) {
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

  return (
    <div className="flex-none">
      {!selectedDate && (
        <span className="text-sm text-muted-foreground">Últimas horas</span>
      )}
      <OrdersKPIs
        reports={reports}
        loading={loading}
        hasDateFilter={!!selectedDate}
      />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 w-[180px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(new Date(selectedDate), "PPP", { locale: es })
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
              </div>
            </PopoverContent>
            {selectedOrders.length > 0 && (
            <OrderActions
              actions={bulkActions}
              onActionClick={handleBulkOrderAction}
              variant="inline"
              selectedCount={selectedOrdersCount}
            />
          )}
            {selectedDate && (
              <div className="flex justify-end p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => dispatch(setSelectedDate(""))}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              </div>
            )}
          </Popover>
        </div>

        <div className="flex justify-end flex-1 items-center space-x-2">
          <div className="relative w-[150px] lg:w-[250px]">
            <Input
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  dispatch(setSelectedDate(""))
                }}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadExcel}
            disabled={selectedOrders.length === 0}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Excel ({selectedOrders.length})
          </Button>
        </div>
      </div>
    </div>
  )
} 