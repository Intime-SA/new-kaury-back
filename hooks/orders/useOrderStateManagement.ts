"use client"

import { OrderStatusType } from "@/components/orders/status/order-status";
import { toast } from "@/components/ui/use-toast";
import { Order } from "@/types/orders";
import { useOrders } from "@/hooks/orders/useOrders";
import { useDispatch } from "react-redux";
import { updateSelectedOrders } from "@/store/slices/ordersSlice";
import { useQueryClient } from "react-query";

type ToastVariant = "default" | "destructive" | "success" | "info" | "warning" | "error";

export interface OrderAction {
  label: string;
  action: string;
  className?: string;
}

interface UseOrderStateManagementProps {
  onSelectOrder?: (order: Order | null) => void;
  selectedOrders?: Order[];
}

export const useOrderStateManagement = ({ onSelectOrder, selectedOrders = [] }: UseOrderStateManagementProps) => {
  const { updateOrderStatus, updateBulkOrderStatus } = useOrders();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const getToastStyles = (newStatus: OrderStatusType): { title: string; variant: ToastVariant } => {
    switch (newStatus) {
      case 'pagoRecibido':
        return {
          title: "¡Pago Recibido!",
          variant: "success",
        };
      case 'empaquetada':
        return {
          title: "¡Orden Empaquetada!",
          variant: "info",
        };
      case 'cancelada':
        return {
          title: "Orden Cancelada",
          variant: "error",
        };
      case 'archivada':
        return {
          title: "Orden Archivada",
          variant: "warning",
        };
      default:
        return {
          title: "¡Éxito!",
          variant: "default",
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
    const description = formatTransitionError(error.message || error.description);
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
      variant: styles.variant,
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

  const handleBulkOrderAction = (action: string) => {
    if (!selectedOrders || selectedOrders.length === 0) return;

    const orderIds = selectedOrders.map(order => order.id);
    const currentStatus = selectedOrders[0].status;

    const allSameStatus = selectedOrders.every(order => order.status === currentStatus);
    if (!allSameStatus) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todas las órdenes seleccionadas deben tener el mismo estado",
      });
      return;
    }

    // Determinar el nuevo estado basado en la acción
    let newStatus: OrderStatusType;
    switch (action) {
      case 'pago':
        newStatus = 'pagoRecibido';
        break;
      case 'empaquetar':
        newStatus = 'empaquetada';
        break;
      case 'cancelar':
        newStatus = 'cancelada';
        break;
      case 'archivar':
        newStatus = 'archivada';
        break;
      default:
        return;
    }

    // Actualizar el estado localmente primero
    const updatedOrders = selectedOrders.map(order => ({
      ...order,
      status: newStatus
    }));

    // Actualizar el caché de React Query
    queryClient.setQueryData(
      ['orders', { status: currentStatus }],
      (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          orders: oldData.orders.map((order: Order) => 
            orderIds.includes(order.id) 
              ? { ...order, status: newStatus }
              : order
          )
        };
      }
    );

    // Actualizar el estado en Redux
    dispatch(updateSelectedOrders(updatedOrders));

    // Luego hacer la petición al servidor
    switch (action) {
      case 'pago':
        updateBulkOrderStatus.mutate(
          { orderIds, newStatus: 'pagoRecibido' },
          {
            onSuccess: () => {
              showSuccessToast(`Se han actualizado ${orderIds.length} órdenes a pago recibido`, 'pagoRecibido');
            },
            onError: (error) => {
              // Si hay error, revertir los cambios en el caché
              queryClient.setQueryData(
                ['orders', { status: currentStatus }],
                (oldData: any) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    orders: oldData.orders.map((order: Order) => 
                      orderIds.includes(order.id) 
                        ? { ...order, status: currentStatus }
                        : order
                    )
                  };
                }
              );
              // Revertir los cambios en Redux
              dispatch(updateSelectedOrders(selectedOrders));
              showErrorToast(error);
            }
          }
        );
        break;
      case 'empaquetar':
        updateBulkOrderStatus.mutate(
          { orderIds, newStatus: 'empaquetada' },
          {
            onSuccess: () => {
              showSuccessToast(`Se han actualizado ${orderIds.length} órdenes a empaquetada`, 'empaquetada');
            },
            onError: (error) => {
              queryClient.setQueryData(
                ['orders', { status: currentStatus }],
                (oldData: any) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    orders: oldData.orders.map((order: Order) => 
                      orderIds.includes(order.id) 
                        ? { ...order, status: currentStatus }
                        : order
                    )
                  };
                }
              );
              dispatch(updateSelectedOrders(selectedOrders));
              showErrorToast(error);
            }
          }
        );
        break;
      case 'cancelar':
        updateBulkOrderStatus.mutate(
          { orderIds, newStatus: 'cancelada' },
          {
            onSuccess: () => {
              showSuccessToast(`Se han cancelado ${orderIds.length} órdenes`, 'cancelada');
            },
            onError: (error) => {
              queryClient.setQueryData(
                ['orders', { status: currentStatus }],
                (oldData: any) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    orders: oldData.orders.map((order: Order) => 
                      orderIds.includes(order.id) 
                        ? { ...order, status: currentStatus }
                        : order
                    )
                  };
                }
              );
              dispatch(updateSelectedOrders(selectedOrders));
              showErrorToast(error);
            }
          }
        );
        break;
      case 'archivar':
        updateBulkOrderStatus.mutate(
          { orderIds, newStatus: 'archivada' },
          {
            onSuccess: () => {
              showSuccessToast(`Se han archivado ${orderIds.length} órdenes`, 'archivada');
            },
            onError: (error) => {
              queryClient.setQueryData(
                ['orders', { status: currentStatus }],
                (oldData: any) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    orders: oldData.orders.map((order: Order) => 
                      orderIds.includes(order.id) 
                        ? { ...order, status: currentStatus }
                        : order
                    )
                  };
                }
              );
              dispatch(updateSelectedOrders(selectedOrders));
              showErrorToast(error);
            }
          }
        );
        break;
    }
  };

  const getBulkOrderActions = (status: OrderStatusType): OrderAction[] => {
    if (!selectedOrders?.length) return [];

    const allSameStatus = selectedOrders.every(order => order.status === status);
    if (!allSameStatus) return [];

    const baseActions: OrderAction[] = [];

    switch (status) {
      case "nueva":
        return [
          ...baseActions,
          { label: "Marcar como pago recibido", action: "pago" },
          { label: "Cancelar órdenes", action: "cancelar", className: "text-destructive" }
        ];
      case "pagoRecibido":
        return [
          ...baseActions,
          { label: "Marcar como empaquetadas", action: "empaquetar" },
          { label: "Cancelar órdenes", action: "cancelar", className: "text-destructive" }
        ];
      case "empaquetada":
        return [
          ...baseActions,
          { label: "Archivar órdenes", action: "archivar" }
        ];
      case "enviada":
        return [
          ...baseActions,
          { label: "Archivar órdenes", action: "archivar" }
        ];
      case "cancelada":
        return [
          ...baseActions,
          { label: "Archivar órdenes", action: "archivar" }
        ];
      case "archivada":
      case "todas":
      default:
        return baseActions;
    }
  };

  return {
    handleOrderAction,
    getOrderActions,
    handleBulkOrderAction,
    getBulkOrderActions,
    hasSelectedOrders: selectedOrders?.length > 0,
    selectedOrdersCount: selectedOrders?.length || 0
  };
}; 