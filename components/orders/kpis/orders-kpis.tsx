"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { OrdersKPIsProps } from "@/types/orders"
import { defaultReports } from "@/lib/constants"

export function OrdersKPIs({ 
  reports = defaultReports,
  loading = false,
  hasDateFilter = false 
}: OrdersKPIsProps) {
  
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ventas Totales
          </CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-[100px]" />
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-bold">{reports.current.totalSales}</div>
              {hasDateFilter && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Un dia antes:  {reports.previous.totalSales}</span>
                    {reports.percentageChange.totalSales > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn(
                      reports.percentageChange.totalSales > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {reports.percentageChange.totalSales > 0 ? '+' : ''}{reports.percentageChange.totalSales.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monto Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-[100px]" />
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {reports.current.totalAmount.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'ARS'
                })}
              </div>
              {hasDateFilter && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Un dia antes:  {reports.previous.totalAmount.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'ARS'
                    })}</span>
                    {reports.percentageChange.totalAmount > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn(
                      reports.percentageChange.totalAmount > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {reports.percentageChange.totalAmount > 0 ? '+' : ''}{reports.percentageChange.totalAmount.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Venta Promedio
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-[100px]" />
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {reports.current.averageSale.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'ARS'
                })}
              </div>
              {hasDateFilter && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Un dia antes:  {reports.previous.averageSale.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'ARS'
                    })}</span>
                    {reports.percentageChange.averageSale > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn(
                      reports.percentageChange.averageSale > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {reports.percentageChange.averageSale > 0 ? '+' : ''}{reports.percentageChange.averageSale.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 