import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { OrderAction } from "@/hooks/useOrderStateManagement"
import { 
  Package, 
  CreditCard, 
  Truck, 
  Archive, 
  XCircle, 
  Eye,
  CheckCircle2
} from "lucide-react"

const actionIcons = {
  view: Eye,
  pago: CreditCard,
  empaquetar: Package,
  archivar: Archive,
  cancelar: XCircle,
}

const actionStyles = {
  view: {
    base: "text-muted-foreground",
    hover: "hover:bg-slate-200 hover:text-slate-900"
  },
  pago: {
    base: "text-green-500 bg-green-500/20",
    hover: "hover:bg-green-600 hover:text-white"
  },
  empaquetar: {
    base: "text-blue-500 bg-blue-500/20",
    hover: "hover:bg-blue-600 hover:text-white"
  },
  archivar: {
    base: "text-yellow-600 bg-yellow-500/20",
    hover: "hover:bg-yellow-600 hover:text-white"
  },
  cancelar: {
    base: "text-red-500 bg-red-500/20",
    hover: "hover:bg-red-600 hover:text-white"
  }
}

interface OrderActionsProps {
  actions: OrderAction[]
  onActionClick: (action: string) => void
  variant?: 'dropdown' | 'inline'
  selectedCount?: number
}

export function OrderActions({ 
  actions, 
  onActionClick, 
  variant = 'dropdown',
  selectedCount 
}: OrderActionsProps) {
  if (actions.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
        {selectedCount && (
          <span className="text-sm text-muted-foreground">
            {selectedCount} {selectedCount === 1 ? 'orden seleccionada' : 'órdenes seleccionadas'}
          </span>
        )}
        <div className="flex items-center gap-1">
          {actions.map((action) => {
            const Icon = actionIcons[action.action as keyof typeof actionIcons]
            const styles = actionStyles[action.action as keyof typeof actionStyles]
            
            return (
              <button
                key={action.action}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                  styles.base,
                  styles.hover,
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

  return (
    <>
      {actions.map((action) => {
        const Icon = actionIcons[action.action as keyof typeof actionIcons]
        const styles = actionStyles[action.action as keyof typeof actionStyles]
        
        return (
          <DropdownMenuItem
            key={action.action}
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              styles.base,
              action.className
            )}
            onClick={() => onActionClick(action.action)}
          >
            <Icon className="h-4 w-4" />
            <span>{action.label}</span>
          </DropdownMenuItem>
        )
      })}
    </>
  )
} 