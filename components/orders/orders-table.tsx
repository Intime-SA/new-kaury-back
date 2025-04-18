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
import { setStatus, setSelectedDate, setSearchNumber } from '@/app/store/slices/ordersSlice'
import { Skeleton } from "@/components/ui/skeleton"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { OrdersTabs } from "./orders-tabs"
import { useDebounce } from 'use-debounce'
import { OrdersKPIs } from "./orders-kpis"

interface OrdersTableProps {
  orders: Order[]
  loading: boolean
  searchTerm: string
  setSearchTerm: (value: string) => void
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  onSelectOrder?: (order: Order | null) => void
  selectedOrderId?: string
  reports: {
    current: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
    previous: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
    percentageChange: {
      totalSales: number
      totalAmount: number
      averageSale: number
    }
  }
}

interface OrderAction {
  label: string
  action: string
  className?: string
}

export function OrdersTable({
  orders,
  loading,
  searchTerm,
  setSearchTerm,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  onSelectOrder,
  selectedOrderId,
  reports
}: OrdersTableProps) {
  const dispatch = useDispatch()
  const { status, selectedDate } = useSelector((state: RootState) => state.orders)
  const { ref, inView } = useInView()
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedValue] = useDebounce(searchTerm, 2000)

  useEffect(() => {
    if (searchTerm !== debouncedValue) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [searchTerm, debouncedValue])

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    dispatch(setSearchNumber(debouncedValue))
  }, [debouncedValue, dispatch])

  const getOrderActions = (status: OrderStatusType): OrderAction[] => {
    const baseActions: OrderAction[] = [
      { label: 'Ver detalles', action: 'view' },
      { label: 'Editar', action: 'edit' },
    ]

    switch (status) {
      case 'nueva':
        return [
          ...baseActions,
          { label: 'Marcar como empaquetada', action: 'empaquetar' },
          { label: 'Marcar como pago recibido', action: 'pago' },
          { label: 'Cancelar orden', action: 'cancelar', className: 'text-destructive' }
        ]
      case 'empaquetada':
        return [
          ...baseActions,
          { label: 'Marcar como pago recibido', action: 'pago' },
          { label: 'Marcar como enviada', action: 'enviar' },
          { label: 'Cancelar orden', action: 'cancelar', className: 'text-destructive' }
        ]
      case 'pagoRecibido':
        return [
          ...baseActions,
          { label: 'Marcar como enviada', action: 'enviar' },
          { label: 'Cancelar orden', action: 'cancelar', className: 'text-destructive' }
        ]
      case 'enviada':
        return [
          ...baseActions,
          { label: 'Archivar orden', action: 'archivar' }
        ]
      case 'cancelada':
        return [
          ...baseActions,
          { label: 'Archivar orden', action: 'archivar' }
        ]
      case 'archivada':
        return baseActions
      default:
        return baseActions
    }
  }

  // Calcular el conteo de órdenes por estado
  const ordersCount = orders.reduce((acc, order) => {
    if (order.status) {
      acc[order.status] = (acc[order.status] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const content = (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-none">
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

      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="sticky top-0 z-10 bg-background border-b">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead className="w-[180px]">Fecha</TableHead>
                    <TableHead className="w-[180px]">Total</TableHead>
                    <TableHead className="w-[120px]">Productos</TableHead>
                    <TableHead className="flex-1">Cliente</TableHead>
                    <TableHead className="w-[100px]">Estado</TableHead>
                    <TableHead className="w-[80px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableBody>
                  {isSearching ? (
                    <TableRow>
                      <TableCell className="w-[40px]">
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="flex-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell className="w-[150px]">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="w-[80px] text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {orders.map((order) => (
                        <TableRow 
                          key={order.id}
                          className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            selectedOrderId === order.id && "bg-muted"
                          )}
                          onClick={() => onSelectOrder?.(order)}
                        >
                          <TableCell className="w-[40px]">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="w-[120px] font-medium">#{order.numberOrder}</TableCell>
                          <TableCell className="w-[180px]">{formatFirebaseTimestamp(order.date)}</TableCell>
                          <TableCell className="w-[180px] font-bold">${order.total.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "ARS",
                          })}</TableCell>
                          <TableCell className="w-[120px]">
                            <Badge variant="outline" className="bg-muted-foreground text-muted-foreground-foreground">{order.orderItems.length} items</Badge>
                          </TableCell>
                          <TableCell className="flex-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {order.infoEntrega.name.charAt(0)}
                                  {order.infoEntrega.apellido.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{order.infoEntrega.name} {order.infoEntrega.apellido}</span>
                            </div>
                          </TableCell>
                          <TableCell className="w-[150px]">
                            <OrderStatus status={order.status as OrderStatusType} />
                          </TableCell>
                          <TableCell className="w-[80px] text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {getOrderActions(order.status as OrderStatusType).map((action) => (
                                  <DropdownMenuItem 
                                    key={action.action}
                                    className={action.className}
                                    onClick={() => {
                                      switch (action.action) {
                                        case 'view':
                                          onSelectOrder?.(order)
                                          break
                                        case 'edit':
                                          // Implementar edición
                                          break
                                        case 'empaquetar':
                                          // Implementar cambio de estado a empaquetada
                                          break
                                        case 'pago':
                                          // Implementar cambio de estado a pago recibido
                                          break
                                        case 'enviar':
                                          // Implementar cambio de estado a enviada
                                          break
                                        case 'cancelar':
                                          // Implementar cancelación
                                          break
                                        case 'archivar':
                                          // Implementar archivado
                                          break
                                      }
                                    }}
                                  >
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                  {isFetchingNextPage && searchTerm === "" && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
              <div ref={ref} className="w-full h-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <OrdersTabs
      orders={{
        nueva: ordersCount['nueva'] || 0,
        empaquetada: ordersCount['empaquetada'] || 0,
        pagoRecibido: ordersCount['pagoRecibido'] || 0,
        enviada: ordersCount['enviada'] || 0,
        cancelada: ordersCount['cancelada'] || 0,
        archivada: ordersCount['archivada'] || 0
      }}
      content={content}
    />
  )
}
