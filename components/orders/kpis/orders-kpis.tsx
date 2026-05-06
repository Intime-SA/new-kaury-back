"use client"

import { ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { OrdersKPIsProps } from "@/types/orders"
import { defaultReports } from "@/lib/constants"

const formatCurrency = (n: number) =>
  n.toLocaleString("es-ES", { style: "currency", currency: "ARS" })

interface KpiCardProps {
  title: string
  value: React.ReactNode
  previous?: React.ReactNode
  delta?: number
  hasDateFilter: boolean
  Icon: any
  accent: "primary" | "success" | "info"
  loading: boolean
}

function KpiCard({ title, value, previous, delta = 0, hasDateFilter, Icon, accent, loading }: KpiCardProps) {
  const accentClasses = {
    primary: "from-rose-500/15 to-red-500/15 text-primary",
    success: "from-emerald-400/15 to-teal-500/15 text-success",
    info: "from-sky-400/15 to-cyan-500/15 text-info",
  }[accent]
  const isPositive = delta >= 0

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
      <div
        className={cn(
          "absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-60 blur-2xl bg-gradient-to-br",
          accentClasses,
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-32" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          )}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-soft",
            accentClasses,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {hasDateFilter && !loading && (
        <div className="relative mt-3 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium",
              isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {isPositive ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs día anterior · {previous}</span>
        </div>
      )}
    </div>
  )
}

export function OrdersKPIs({
  reports = defaultReports,
  loading = false,
  hasDateFilter = false,
}: OrdersKPIsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3 stagger">
      <KpiCard
        title="Ventas Totales"
        value={reports.current.totalSales}
        previous={reports.previous.totalSales}
        delta={reports.percentageChange.totalSales}
        hasDateFilter={hasDateFilter}
        Icon={ShoppingBag}
        accent="primary"
        loading={loading}
      />
      <KpiCard
        title="Monto Total"
        value={formatCurrency(reports.current.totalAmount)}
        previous={formatCurrency(reports.previous.totalAmount)}
        delta={reports.percentageChange.totalAmount}
        hasDateFilter={hasDateFilter}
        Icon={DollarSign}
        accent="success"
        loading={loading}
      />
      <KpiCard
        title="Venta Promedio"
        value={formatCurrency(reports.current.averageSale)}
        previous={formatCurrency(reports.previous.averageSale)}
        delta={reports.percentageChange.averageSale}
        hasDateFilter={hasDateFilter}
        Icon={TrendingUp}
        accent="info"
        loading={loading}
      />
    </div>
  )
}
