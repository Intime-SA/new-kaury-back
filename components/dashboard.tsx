"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { ThemeProvider } from "@/components/theme-provider"

export default function Dashboard() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background w-[100vw]">
          <DashboardContent />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
