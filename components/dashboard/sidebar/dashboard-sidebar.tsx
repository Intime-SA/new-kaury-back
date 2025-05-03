"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Package, Users, BarChart2, Settings, HelpCircle, Tag, List, Archive } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    title: 'PRINCIPAL',
    items: [
/*       { name: 'Dashboard', href: '/', icon: Home, enabled: true }, */
      { name: 'Órdenes', href: '/', icon: ShoppingBag, enabled: true },
      { 
        name: 'Productos', 
        href: '/products', 
        icon: Package, 
        enabled: true,
        subItems: [
          { name: 'Lista de productos', href: '/products/list', icon: List },
          { name: 'Categorías', href: '/products/categories', icon: Tag },
          { name: 'Inventario', href: '/products/create', icon: Archive },
        ]
      },
      { name: 'Clientes', href: '#', icon: Users, enabled: false },
    ],
  },
  {
    title: 'ANÁLISIS',
    items: [
      { name: 'Reportes', href: '#', icon: BarChart2, enabled: false },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { name: 'Configuración', href: '#', icon: Settings, enabled: false },
      { name: 'Ayuda', href: '#', icon: HelpCircle, enabled: false },
    ],
  },
]

interface DashboardSidebarProps {
  isCollapsed?: boolean
}

export function DashboardSidebar({ isCollapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

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
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const isExpanded = expandedItems.includes(item.name)
                const Icon = item.icon
                
                return (
                  <div key={item.name}>
                    {item.enabled ? (
                      !item.subItems ? (
                        <Link href={item.href} passHref>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                              isActive 
                                ? 'bg-[#1F1F1F] text-gray-100' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1F1F1F]'
                            )}
                          >
                            <Icon className="w-5 h-5 min-w-[20px]" />
                            <span className={`flex-1 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden group-hover:block group-hover:opacity-100' : ''}`}>
                              {item.name}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                              isActive
                                ? 'bg-[#1F1F1F] text-gray-100' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1F1F1F]'
                            )}
                            onClick={() => toggleExpand(item.name)}
                          >
                            <Icon className="w-5 h-5 min-w-[20px]" />
                            <span className={`flex-1 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden group-hover:block group-hover:opacity-100' : ''}`}>
                              {item.name}
                            </span>
                            {!isCollapsed && (
                              <svg
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                          
                          {isExpanded && !isCollapsed && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.subItems.map((subItem) => {
                                const SubIcon = subItem.icon
                                const isSubActive = pathname === subItem.href
                                
                                return (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={cn(
                                      "flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors",
                                      isSubActive
                                        ? 'bg-[#1F1F1F] text-gray-100'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#1F1F1F]'
                                    )}
                                  >
                                    <SubIcon className="w-4 h-4" />
                                    <span>{subItem.name}</span>
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <div className="flex items-center gap-3 px-2 py-2 text-sm rounded-lg text-gray-500 cursor-not-allowed">
                        <Icon className="w-5 h-5 min-w-[20px]" />
                        <span className={`flex-1 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden group-hover:block group-hover:opacity-100' : ''}`}>
                          {item.name}
                        </span>
                        {!isCollapsed && (
                          <Badge variant="outline" className="text-[10px] h-4 bg-transparent border-gray-800 text-gray-500">
                            Próximamente
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
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
