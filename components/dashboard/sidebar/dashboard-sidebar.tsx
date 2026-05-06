"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package,
  Users,
  Settings,
  Tag,
  List,
  Archive,
  Receipt,
  ChevronRight,
} from 'lucide-react'
import {
  KauryBag,
  KauryChart,
  KauryGift,
  KauryCoupon,
} from '@/components/icons'
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    title: 'Principal',
    items: [
      { name: 'Órdenes', href: '/', icon: KauryBag, enabled: true },
      {
        name: 'Productos',
        href: '/products',
        icon: Package,
        enabled: true,
        subItems: [
          { name: 'Lista de productos', href: '/products/list', icon: List },
          { name: 'Categorías', href: '/products/categories', icon: Tag },
          { name: 'Inventario', href: '/products/create', icon: Archive },
        ],
      },
      { name: 'Clientes', href: '/users', icon: Users, enabled: true },
      { name: 'Cupones', href: '/cupones', icon: KauryCoupon, enabled: true },
      { name: 'Regalos', href: '/regalos', icon: KauryGift, enabled: true },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { name: 'Reportes', href: '/reports', icon: KauryChart, enabled: true },
    ],
  },
  {
    title: 'Admin',
    items: [
      { name: 'Comprobantes', href: '/admin/payment-requests', icon: Receipt, enabled: true },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        name: 'Configuración',
        href: '/settings',
        icon: Settings,
        enabled: true,
        subItems: [
          { name: 'General', href: '/settings/common', icon: Settings },
          { name: 'Envíos', href: '/settings/shipping', icon: Package },
          { name: 'Pagos', href: '/settings/payments', icon: Tag },
        ],
      },
    ],
  },
]

interface DashboardSidebarProps {
  isCollapsed?: boolean
}

export function DashboardSidebar({ isCollapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // auto-expand active group
  useEffect(() => {
    navigation.forEach((group) => {
      group.items.forEach((item) => {
        if (
          'subItems' in item &&
          item.subItems &&
          (pathname === item.href || pathname.startsWith(item.href + '/'))
        ) {
          setExpandedItems((prev) =>
            prev.includes(item.name) ? prev : [...prev, item.name]
          )
        }
      })
    })
  }, [pathname])

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-20 flex items-center px-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 w-full">
          <img
            src="/kaury_logo_19.svg"
            alt="Kaury"
            className="h-12 w-12 shrink-0 select-none"
          />
          <div
            className={cn(
              'flex flex-col transition-opacity duration-300 min-w-0',
              isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Backoffice
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto custom-scrollbar py-4">
        {navigation.map((group) => (
          <div key={group.title} className="px-3 mb-5">
            <h2
              className={cn(
                'px-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.12em] mb-2 transition-opacity duration-300',
                isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              )}
            >
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href + '/'))
                const isExpanded = expandedItems.includes(item.name)
                const Icon = item.icon
                const hasSubItems = 'subItems' in item && item.subItems

                if (!item.enabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-muted-foreground/60 cursor-not-allowed"
                    >
                      <Icon className="h-4 w-4 min-w-[16px]" />
                      <span
                        className={cn(
                          'flex-1 transition-opacity duration-300',
                          isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                        )}
                      >
                        {item.name}
                      </span>
                      {!isCollapsed && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 bg-transparent border-border text-muted-foreground"
                        >
                          Pronto
                        </Badge>
                      )}
                    </div>
                  )
                }

                if (!hasSubItems) {
                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={cn(
                          'group/item relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                          isActive && !isCollapsed
                            ? 'bg-muted text-foreground'
                            : !isActive
                            ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            : 'text-foreground'
                        )}
                      >
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-brand" />
                        )}
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                            isActive
                              ? isCollapsed
                                ? 'text-primary group-hover:bg-gradient-brand group-hover:text-white group-hover:shadow-pop'
                                : 'bg-gradient-brand text-white shadow-pop'
                              : 'text-muted-foreground group-hover/item:bg-muted group-hover/item:text-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span
                          className={cn(
                            'flex-1 truncate transition-opacity duration-300',
                            isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                          )}
                        >
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  )
                }

                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      className={cn(
                        'group/item w-full relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive && !isCollapsed
                          ? 'bg-muted text-foreground'
                          : !isActive
                          ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          : 'text-foreground'
                      )}
                      onClick={() => toggleExpand(item.name)}
                    >
                      {isActive && !isCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-brand" />
                      )}
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                          isActive
                            ? isCollapsed
                              ? 'text-primary group-hover:bg-gradient-brand group-hover:text-white group-hover:shadow-pop'
                              : 'bg-gradient-brand text-white shadow-pop'
                            : 'text-muted-foreground group-hover/item:bg-muted group-hover/item:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={cn(
                          'flex-1 text-left truncate transition-opacity duration-300',
                          isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                        )}
                      >
                        {item.name}
                      </span>
                      {!isCollapsed && (
                        <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      )}
                    </button>

                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-smooth',
                        isExpanded && !isCollapsed
                          ? 'max-h-60 opacity-100 mt-1'
                          : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="ml-4 pl-3 border-l border-border/60 space-y-0.5">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isSubActive = pathname === subItem.href
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={cn(
                                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-200',
                                isSubActive
                                  ? 'bg-muted text-foreground font-medium'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              )}
                            >
                              <SubIcon className={cn("h-3.5 w-3.5", isSubActive && "text-primary")} />
                              <span className="truncate">{subItem.name}</span>
                              {isSubActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-brand" />
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 pb-3">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 transition-all hover:bg-muted/70">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-brand text-white flex items-center justify-center text-sm font-semibold shadow-pop">
                I
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
            </div>
            <div
              className={cn(
                'flex-1 min-w-0 transition-opacity duration-300',
                isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              )}
            >
              <p className="text-sm font-semibold text-foreground truncate">Invertimesa</p>
              <p className="text-[11px] text-muted-foreground truncate">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
