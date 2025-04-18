'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
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