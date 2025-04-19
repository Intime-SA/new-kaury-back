"use client"

import { OrderStatusType } from "@/components/orders/status/order-status";
import { toast } from "@/components/ui/use-toast";
import { Order } from "@/types/orders";
import { useOrders } from "@/hooks/useOrders";

export interface OrderAction {
  label: string;
  action: string;
  className?: string;
}

interface UseOrderStateManagementProps {
  onSelectOrder?: (order: Order | null) => void;
}

export const useOrderStateManagement = ({ onSelectOrder }: UseOrderStateManagementProps) => {
  const { updateOrderStatus } = useOrders();

  const getToastStyles = (newStatus: OrderStatusType) => {
    switch (newStatus) {
      case 'pagoRecibido':
        return {
          title: "¡Pago Recibido!",
          className: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900",
          textClass: "text-green-600 dark:text-green-400"
        };
      case 'empaquetada':
        return {
          title: "¡Orden Empaquetada!",
          className: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900",
          textClass: "text-blue-600 dark:text-blue-400"
        };
      case 'cancelada':
        return {
          title: "Orden Cancelada",
          className: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900",
          textClass: "text-red-600 dark:text-red-400"
        };
      case 'archivada':
        return {
          title: "Orden Archivada",
          className: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-900",
          textClass: "text-gray-600 dark:text-gray-400"
        };
      default:
        return {
          title: "¡Éxito!",
          className: "",
          textClass: ""
        };
    }
  };

  const formatTransitionError = (message: string) => {
    const transitionMatch = message.match(/Invalid status transition from (\w+) to (\w+)/);
    if (transitionMatch) {
      const [_, fromStatus, toStatus] = transitionMatch;
      
      const statusTranslations: Record<string, string> = {
        'nueva': 'Nueva',
        'pagoRecibido': 'Pago Recibido',
        'empaquetada': 'Empaquetada',
        'enviada': 'Enviada',
        'cancelada': 'Cancelada',
        'archivada': 'Archivada'
      };

      const fromStatusSpanish = statusTranslations[fromStatus] || fromStatus;
      const toStatusSpanish = statusTranslations[toStatus] || toStatus;

      return `No es posible cambiar el estado de una orden de "${fromStatusSpanish}" a "${toStatusSpanish}"`;
    }
    
    return message;
  };

  const showErrorToast = (error: any) => {
    const description = formatTransitionError(error.description);
    toast({
      variant: "destructive",
      title: "Error al actualizar estado",
      description: description,
    });
  };

  const showSuccessToast = (message: string, newStatus: OrderStatusType) => {
    const styles = getToastStyles(newStatus);
    toast({
      title: styles.title,
      description: message,
      className: `${styles.className} ${styles.textClass}`,
      duration: 3000,
    });
  };

  const handleOrderAction = (order: Order, action: string) => {
    if (action === 'view') {
      onSelectOrder?.(order);
      return;
    }

    switch (action) {
      case 'edit':
        break;
      case 'pago':
        updateOrderStatus.mutate(
          { orderId: order.id, newStatus: 'pagoRecibido' },
          {
            onSuccess: (updatedOrder) => {
              showSuccessToast("La orden ha sido marcada como pago recibido", 'pagoRecibido');
              onSelectOrder?.(updatedOrder);
            },
            onError: showErrorToast
          }
        );
        break;
      case 'cancelar':
        updateOrderStatus.mutate(
          { orderId: order.id, newStatus: 'cancelada' },
          {
            onSuccess: (updatedOrder) => {
              showSuccessToast("La orden ha sido cancelada", 'cancelada');
              onSelectOrder?.(updatedOrder);
            },
            onError: showErrorToast
          }
        );
        break;
      case 'empaquetar':
        updateOrderStatus.mutate(
          { orderId: order.id, newStatus: 'empaquetada' },
          {
            onSuccess: (updatedOrder) => {
              showSuccessToast("La orden ha sido marcada como empaquetada", 'empaquetada');
              onSelectOrder?.(updatedOrder);
            },
            onError: showErrorToast
          }
        );
        break;
      case 'archivar':
        updateOrderStatus.mutate(
          { orderId: order.id, newStatus: 'archivada' },
          {
            onSuccess: (updatedOrder) => {
              showSuccessToast("La orden ha sido archivada", 'archivada');
              onSelectOrder?.(updatedOrder);
            },
            onError: showErrorToast
          }
        );
        break;
    }
  };

  const getOrderActions = (status: OrderStatusType): OrderAction[] => {
    const baseActions: OrderAction[] = [
      { label: "Ver detalles", action: "view" }
    ];

    switch (status) {
      case "nueva":
        return [
          ...baseActions,
          { label: "Marcar como pago recibido", action: "pago" },
          { label: "Cancelar orden", action: "cancelar", className: "text-destructive" }
        ];
      case "pagoRecibido":
        return [
          ...baseActions,
          { label: "Marcar como empaquetada", action: "empaquetar" },
          { label: "Cancelar orden", action: "cancelar", className: "text-destructive" }
        ];
      case "empaquetada":
        return [
          ...baseActions,
          { label: "Archivar orden", action: "archivar" }
        ];
      case "enviada":
        return [
          ...baseActions,
          { label: "Archivar orden", action: "archivar" }
        ];
      case "cancelada":
        return [
          ...baseActions,
          { label: "Archivar orden", action: "archivar" }
        ];
      case "archivada":
      case "todas":
      default:
        return baseActions;
    }
  };

  return {
    handleOrderAction,
    getOrderActions
  };
}; 