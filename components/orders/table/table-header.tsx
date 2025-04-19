import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/app/store/store"
import { setSelectedDate } from "@/app/store/slices/ordersSlice"
import { OrdersKPIs } from "../kpis/orders-kpis"

interface TableHeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  reports: any
  loading: boolean
}

export function TableHeader({ searchTerm, setSearchTerm, reports, loading }: TableHeaderProps) {
  const dispatch = useDispatch()
  const { selectedDate } = useSelector((state: RootState) => state.orders)

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
          <Input
            placeholder="Buscar órdenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>
      </div>
    </div>
  )
} 