import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "./table-skeleton"
import { OrderTableRow } from "./table-row"
import type { Order } from "@/types/orders"
import { OrderStatusType } from "../status/order-status"
import { OrderAction } from "@/hooks/useOrderStateManagement"
import { Checkbox } from "@/components/ui/checkbox"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/app/store/store"
import { toggleOrderSelection, toggleAllOrders } from "@/app/store/slices/ordersSlice"

interface TableContentProps {
  orders: Order[]
  isSearching: boolean
  isFetchingNextPage: boolean
  searchTerm: string
  selectedOrderId?: string
  onSelectOrder?: (order: Order | null) => void
  getOrderActions: (status: OrderStatusType) => OrderAction[]
  handleOrderAction: (order: Order, action: string) => void
  loading?: boolean
}

export function TableContent({
  orders,
  isSearching,
  isFetchingNextPage,
  searchTerm,
  selectedOrderId,
  onSelectOrder,
  getOrderActions,
  handleOrderAction,
  loading = false
}: TableContentProps) {
  const dispatch = useDispatch()
  const { selectedOrders, isAllSelected } = useSelector((state: RootState) => state.orders)

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={() => dispatch(toggleAllOrders(orders))}
              />
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
        <TableBody>
          {loading || isSearching ? (
            <TableSkeleton rows={10} />
          ) : (
            <>
              {orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  selectedOrderId={selectedOrderId}
                  onSelectOrder={onSelectOrder}
                  getOrderActions={getOrderActions}
                  handleOrderAction={handleOrderAction}
                  isSelected={selectedOrders.some(selected => selected.id === order.id)}
                  onToggleSelection={() => dispatch(toggleOrderSelection(order))}
                />
              ))}
            </>
          )}
          {isFetchingNextPage && searchTerm === "" && (
            <TableSkeleton rows={10} />
          )}
        </TableBody>
      </Table>
    </div>
  )
} 