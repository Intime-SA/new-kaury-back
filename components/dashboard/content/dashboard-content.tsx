"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Orders } from "@/components/orders/orders"; 
import { useOrders } from "@/hooks/orders/useOrders";
import { Order } from "@/types/orders";
import { OrderDetails } from "../../orders/detail/order-details";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function DashboardContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useOrders();

  const orders = data?.pages.flatMap((page) => page.data) || [];
  const reports = data?.pages[0]?.reports || {
    current: { totalSales: 0, totalAmount: 0, averageSale: 0 },
    previous: { totalSales: 0, totalAmount: 0, averageSale: 0 },
    percentageChange: { totalSales: 0, totalAmount: 0, averageSale: 0 },
  };

  // Abrir orden desde query param ?openOrder=id
  const openOrderId = searchParams.get("openOrder");
  const openOrderHandled = useRef<string | null>(null);
  useEffect(() => {
    if (!openOrderId || !API_BASE_URL || openOrderHandled.current === openOrderId) return;

    const orderFromList = orders.find((o: Order) => o._id === openOrderId);
    if (orderFromList) {
      openOrderHandled.current = openOrderId;
      setSelectedOrder({ ...orderFromList, id: orderFromList.id || orderFromList._id });
      router.replace("/", { scroll: false });
      return;
    }

    fetch(`${API_BASE_URL}/userOrders/${openOrderId}`)
      .then((res) => res.json())
      .then((result) => {
        openOrderHandled.current = openOrderId;
        if (result?.success && result?.data) {
          const order = result.data;
          setSelectedOrder({ ...order, id: order.id || order._id });
        }
        router.replace("/", { scroll: false });
      })
      .catch(() => {
        openOrderHandled.current = openOrderId;
        router.replace("/", { scroll: false });
      });
  }, [openOrderId, orders, router]);

  return (
    <div className="flex-1">
      <div className="px-3 sm:px-5 py-4">
        <div className="flex">
          <div className={`flex-1 ${selectedOrder ? 'pr-[380px]' : ''}`}>
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
              selectedOrderId={selectedOrder?._id ?? selectedOrder?.id}
            />
          </div>
          {selectedOrder && (
            <div className="fixed top-20 right-4 w-[360px] h-[calc(100vh-6rem)] overflow-y-auto scroll-hidden bg-card border border-border/70 rounded-2xl shadow-card z-[9999] animate-slide-up">
              <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
