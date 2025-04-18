"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal, Search, Calendar, Filter, ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { OrderStatus, OrderStatusType } from "@/app/components/OrderStatus"
import type { Order } from "@/types/orders"
import { formatFirebaseTimestamp } from "@/lib/utils"
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/app/store/store'
import { setStatus, setSelectedDate } from '@/app/store/slices/ordersSlice'

interface OrdersTableProps {
  orders: Order[]
  currentOrders: Order[]
  ordersLength: number
  currentPage: number
  ordersPerPage: number
  searchTerm: string
  loading: boolean
  setSearchTerm: (term: string) => void
  paginate: (pageNumber: number) => void
}

export function OrdersTable({
  orders,
  currentOrders,
  ordersLength,
  currentPage,
  ordersPerPage,
  searchTerm,
  loading,
  setSearchTerm,
  paginate,
}: OrdersTableProps) {
  const dispatch = useDispatch()
  const { status, selectedDate } = useSelector((state: RootState) => state.orders)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Órdenes</h1>
        <p className="text-muted-foreground">Gestiona y monitorea todas las órdenes de compra.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de órdenes</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersLength}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">↑ 12.5%</span> vs. mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Órdenes pendientes</CardTitle>
            <CardDescription>Requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-500">↑ 8.2%</span> vs. mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,680.00</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">↑ 18.3%</span> vs. mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket promedio</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$196.86</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500">↑ 5.1%</span> vs. mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs value={status} onValueChange={(value) => dispatch(setStatus(value as OrderStatusType))}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="nueva">Nuevas</TabsTrigger>
              <TabsTrigger value="empaquetada">Empaquetadas</TabsTrigger>
              <TabsTrigger value="pagoRecibido">Pago Recibido</TabsTrigger>
              <TabsTrigger value="enviada">Enviadas</TabsTrigger>
              <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
              <TabsTrigger value="archivada">Archivadas</TabsTrigger>
            </TabsList>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva orden
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
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
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate ? new Date(selectedDate) : undefined}
                    onSelect={(date) => {
                      const event = {
                        target: {
                          value: date ? date.toISOString() : ''
                        }
                      }
                      dispatch(setSelectedDate(event.target.value))
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">En proceso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative ml-auto">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar orden..."
                className="h-8 w-[200px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value={status} className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <p>Cargando órdenes...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            ID
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Fecha
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Total
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Productos</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium">#{order.numberOrder}</TableCell>
                          <TableCell>{formatFirebaseTimestamp(order.date)}</TableCell>
                          <TableCell>${order.total.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "ARS",
                          })}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.orderItems.length} items</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{order.infoEntrega.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span>{order.infoEntrega.name} {order.infoEntrega.apellido}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <OrderStatus status={order.status as OrderStatusType} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Marcar como completada</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando <strong>{currentOrders.length}</strong> de <strong>{orders.length}</strong> resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Página anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Página siguiente</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
