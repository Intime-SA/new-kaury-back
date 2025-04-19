"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { OrdersTableProps } from "@/types/orders";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedDate,
  setSearchNumber,
} from "@/app/store/slices/ordersSlice";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { OrdersTabs } from "./tabs/orders-tabs";
import { useDebounce } from "use-debounce";
import { useOrderStateManagement } from "@/hooks/useOrderStateManagement";
import { TableHeader as OrdersTableHeader } from "./table/table-header";
import { TableContent } from "./table/table-content";
import { RootState } from "@/app/store/store";

export function Orders({
  orders,
  loading,
  searchTerm,
  setSearchTerm,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  onSelectOrder,
  selectedOrderId,
  reports,
}: OrdersTableProps) {
  const dispatch = useDispatch();
  const { ref, inView } = useInView();
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedValue] = useDebounce(searchTerm, 2000);
  const { handleOrderAction, getOrderActions } = useOrderStateManagement({
    onSelectOrder,
  });
  const status = useSelector((state: RootState) => state.orders.status);

  useEffect(() => {
    if (searchTerm !== debouncedValue) {
      dispatch(setSelectedDate(""));
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedValue]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    dispatch(setSearchNumber(debouncedValue));
  }, [debouncedValue, dispatch]);

  // Limpiar el término de búsqueda cuando cambia el estado
  useEffect(() => {
    setSearchTerm("");
  }, [status, setSearchTerm]);

  // Calcular el conteo de órdenes por estado
  const ordersCount = orders.reduce((acc, order) => {
    if (order.status) {
      acc[order.status] = (acc[order.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const content = (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <OrdersTableHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        reports={reports}
        loading={loading}
      />
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="sticky top-0 z-10 bg-background border-b">
              <TableContent
                orders={orders}
                isSearching={isSearching}
                isFetchingNextPage={isFetchingNextPage}
                searchTerm={searchTerm}
                selectedOrderId={selectedOrderId}
                onSelectOrder={onSelectOrder}
                getOrderActions={getOrderActions}
                handleOrderAction={handleOrderAction}
                loading={loading}
              />
              <div className="flex-1">
                <div ref={ref} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <OrdersTabs
      orders={{
        nueva: ordersCount["nueva"] || 0,
        empaquetada: ordersCount["empaquetada"] || 0,
        pagoRecibido: ordersCount["pagoRecibido"] || 0,
        enviada: ordersCount["enviada"] || 0,
        cancelada: ordersCount["cancelada"] || 0,
        archivada: ordersCount["archivada"] || 0,
      }}
      content={content}
    />
  );
}
