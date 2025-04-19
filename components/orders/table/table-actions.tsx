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

const actionColors = {
  view: "text-muted-foreground",
  pago: "text-green-500",
  empaquetar: "text-blue-500",
  archivar: "text-white-500",
  cancelar: "text-red-500",
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
      <div className="flex items-center border rounded-md bg-muted/50">
        <div className="flex items-center gap-1">
          {actions.map((action) => {
            const Icon = actionIcons[action.action as keyof typeof actionIcons]
            const color = actionColors[action.action as keyof typeof actionColors]
            
            return (
              <button
                key={action.action}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                  `hover:bg-${action.action === 'cancelar' ? 'red' : 'green'}-500 hover:text-white`,
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

  return (
    <>
      {actions.map((action) => {
        const Icon = actionIcons[action.action as keyof typeof actionIcons]
        const color = actionColors[action.action as keyof typeof actionColors]
        
        return (
          <DropdownMenuItem
            key={action.action}
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              color,
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