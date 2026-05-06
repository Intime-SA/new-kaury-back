import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Receipt } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn, formatISODate } from "@/lib/utils"
import { OrderStatus } from "../status/order-status"
import { OrderStatusType } from "../status/order-status"
import type { Order } from "@/types/orders"
import { OrderAction } from "@/hooks/orders/useOrderStateManagement"
import { formatFirebaseTimestamp } from "@/lib/utils"
import { TableCell, TableRow } from "@/components/ui/table"
import { OrderActions } from "./table-actions"
import { useDispatch } from "react-redux"
import { clearSelectedOrders, toggleOrderSelection } from "@/store/slices/ordersSlice"

interface TableRowProps {
  order: Order
  selectedOrderId?: string
  onSelectOrder?: (order: Order | null) => void
  getOrderActions: (status: OrderStatusType) => OrderAction[]
  handleOrderAction: (order: Order, action: string) => void
  isSelected: boolean
  onToggleSelection: () => void
}

export function OrderTableRow({ 
  order, 
  selectedOrderId, 
  onSelectOrder, 
  getOrderActions,
  handleOrderAction,
  isSelected,
  onToggleSelection
}: TableRowProps) {
  const dispatch = useDispatch();

  const handleOrderClick = () => {
    dispatch(clearSelectedOrders());
    onSelectOrder?.({...order, id: order._id});
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedOrderId) {
      onSelectOrder?.(null);
    }
    onToggleSelection();
  };

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        selectedOrderId === order._id && "bg-accent/60"
      )}
      onClick={handleOrderClick}
    >
      <TableCell className="w-[40px]" onClick={handleCheckboxChange}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => {}}
        />
      </TableCell>
      <TableCell className="w-[120px] font-semibold text-foreground">
        <span className="text-primary">#</span>{order.numberOrder}
      </TableCell>
      <TableCell className="w-[60px] text-center">
        {order.requestPaymentId ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-success/10 mx-auto" title="Comprobante asociado">
            <Receipt className="h-3.5 w-3.5 text-success" />
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </TableCell>
      <TableCell className="w-[180px] text-muted-foreground">
        {formatISODate(order.date)}
      </TableCell>
      <TableCell className="w-[180px] font-semibold text-foreground">
        {order.total.toLocaleString("es-ES", {
          style: "currency",
          currency: "ARS",
        })}
      </TableCell>
      <TableCell className="w-[120px]">
        <Badge variant="soft" className="font-medium">
          {order.orderItems?.length} items
        </Badge>
      </TableCell>
      <TableCell className="flex-1">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarFallback className="bg-gradient-brand text-white text-xs font-semibold">
              {order.infoEntrega.name.charAt(0)}
              {order.infoEntrega.apellido.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">
            {order.infoEntrega.name} {order.infoEntrega.apellido}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-[150px]">
        <OrderStatus status={order.status as OrderStatusType} />
      </TableCell>
      <TableCell className="w-[80px] text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <OrderActions
              actions={getOrderActions(order.status as OrderStatusType)}
              onActionClick={(action) => handleOrderAction(order, action)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
} 