'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Menu, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className="fixed left-0 top-0 h-full w-20 hover:w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] 
          transition-all duration-300 z-50 group shadow-xl"
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <DashboardSidebar isCollapsed={!isSidebarOpen} />
      </aside>

      {/* Content wrapper */}
      <div className="absolute left-20 right-0 top-0 bottom-0 flex flex-col">
        {/* Header */}
        <header className="flex-none h-16 flex items-center gap-4 bg-[#0A0A0A] border-b border-[#1F1F1F] px-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-[#1F1F1F] border-0 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200 hover:bg-[#1F1F1F]">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200 hover:bg-[#1F1F1F]">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 