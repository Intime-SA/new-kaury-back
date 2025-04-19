import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { OrderAction } from "@/hooks/useOrderStateManagement"
import { 
  Package, 
  CreditCard, 
  Archive, 
  XCircle,
  CheckCircle2
} from "lucide-react"

const actionIcons = {
  pago: CreditCard,
  empaquetar: Package,
  archivar: Archive,
  cancelar: XCircle,
}

const actionColors = {
  pago: "text-green-500",
  empaquetar: "text-blue-500",
  archivar: "text-white-500",
  cancelar: "text-red-500",
}

interface BulkActionsProps {
  actions: OrderAction[]
  onActionClick: (action: string) => void
  selectedCount: number
}

export function BulkActions({ actions, onActionClick, selectedCount }: BulkActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
      <span className="text-sm text-muted-foreground">
        {selectedCount} {selectedCount === 1 ? 'orden seleccionada' : 'órdenes seleccionadas'}
      </span>
      <div className="flex items-center gap-1">
        {actions.map((action) => {
          const Icon = actionIcons[action.action as keyof typeof actionIcons]
          const color = actionColors[action.action as keyof typeof actionColors]
          
          return (
            <button
              key={action.action}
              className={cn(
                "flex items-center gap-2 px-1 py-1 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                color,
                action.className
              )}
              onClick={() => onActionClick(action.action)}
            >
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
} 