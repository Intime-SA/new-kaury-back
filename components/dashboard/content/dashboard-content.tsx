"use client";

import { useState } from "react";
import { Orders } from "@/components/orders/orders"; 
import { useOrders } from "@/hooks/orders/useOrders";
import { Order } from "@/types/orders";
import { OrderDetails } from "../../orders/detail/order-details";

export function DashboardContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useOrders();

  const orders = data?.pages.flatMap((page) => page.data) || [];
  const reports = data?.pages[0]?.reports || {
    current: { totalSales: 0, totalAmount: 0, averageSale: 0 },
    previous: { totalSales: 0, totalAmount: 0, averageSale: 0 },
    percentageChange: { totalSales: 0, totalAmount: 0, averageSale: 0 },
  };

  return (
    <div className="flex-1">
      <div className="p-6">
        <div className="flex">
          <div className={`flex-1 ${selectedOrder ? 'pr-[35%]' : ''}`}>
            <Orders
              orders={orders}
              loading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              reports={reports}
              onSelectOrder={setSelectedOrder}
              selectedOrderId={selectedOrder?.id}
            />
          </div>  
          {selectedOrder && (
            <div className="fixed top-20 right-10 w-[calc(30%-1.5rem)] h-[calc(100vh-3rem)] overflow-y-auto bg-background border rounded-lg shadow-lg z-[9999]">
              <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
