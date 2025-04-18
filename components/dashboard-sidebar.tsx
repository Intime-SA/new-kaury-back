"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Package, Users, BarChart2, Settings, HelpCircle } from 'lucide-react'

const navigation = [
  {
    title: 'PRINCIPAL',
    items: [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'Órdenes', href: '/orders', icon: ShoppingBag },
      { name: 'Productos', href: '/products', icon: Package },
      { name: 'Clientes', href: '/customers', icon: Users },
    ],
  },
  {
    title: 'ANÁLISIS',
    items: [
      { name: 'Reportes', href: '/reports', icon: BarChart2 },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { name: 'Configuración', href: '/settings', icon: Settings },
      { name: 'Ayuda', href: '/help', icon: HelpCircle },
    ],
  },
]

interface DashboardSidebarProps {
  isCollapsed?: boolean
}

export function DashboardSidebar({ isCollapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/kaury_logo_19.svg" alt="kaury" className="w-20 h-20" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-6">
        {navigation.map((group) => (
          <div key={group.title} className="px-4 mb-6">
            <h2 className={`px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden group-hover:block group-hover:opacity-100' : ''}`}>
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-[#1F1F1F] text-gray-100' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#1F1F1F]'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 min-w-[20px]" />
                    <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden group-hover:block group-hover:opacity-100' : ''}`}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1F1F1F] cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-gray-400">
            N
          </div>
          <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden group-hover:block group-hover:opacity-100' : ''}`}>
            <p className="text-sm font-medium text-gray-200 truncate">Invertimesa</p>
            <p className="text-xs text-gray-400 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  )
}
