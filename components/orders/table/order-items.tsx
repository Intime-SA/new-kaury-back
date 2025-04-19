import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import type { OrderItem } from "@/types/orders"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrderItemsProps {
  items: OrderItem[]
  orderNumber: string
  onOpenChange?: (isOpen: boolean) => void
}

export function OrderItems({ items, orderNumber, onOpenChange }: OrderItemsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <div onClick={stopPropagation}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className="bg-muted-foreground text-muted-foreground-foreground cursor-pointer hover:bg-muted-foreground/80"
          >
            {items.length} items
          </Badge>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0" 
          align="start"
          side="right"
        >
          <div className="flex items-center justify-between border-b p-2">
            <span className="font-medium">
              Productos - <span className="font-bold">#{orderNumber}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 hover:bg-muted"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div 
            className="max-h-[300px] overflow-auto [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="h-8 text-xs text-center">ID Producto</TableHead>
                  <TableHead className="h-8 text-xs text-center">Cantidad</TableHead>
                  <TableHead className="h-8 text-xs text-center">Precio Unit.</TableHead>
                  <TableHead className="h-8 text-xs text-center">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-transparent border-b border-border/50 last:border-0">
                    <TableCell className="py-2 text-xs text-center">
                      <div className="font-bold">{item.id}</div>
                      <div className="text-muted-foreground">{item.name}</div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-center">{item.quantity}</TableCell>
                    <TableCell className="py-2 text-xs text-center">
                      ${item.unit_price.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-center">
                      ${(item.unit_price * item.quantity).toLocaleString("es-AR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t p-2 flex justify-end items-center gap-2 bg-muted/50">
            <span className="text-sm font-medium">Total:</span>
            <span className="text-sm font-bold">
              ${items.reduce((total, item) => total + (item.unit_price * item.quantity), 0).toLocaleString("es-AR")}
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 