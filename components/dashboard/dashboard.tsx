"use client"

import { Suspense } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardContent } from "@/components/dashboard/content/dashboard-content"
import { ThemeProvider } from "@/providers/theme-provider"

export default function Dashboard() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <SidebarProvider>
        <div className="flex min-h-screen bg-transparent w-full">
          <Suspense fallback={null}>
            <DashboardContent />
          </Suspense>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
