'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/dashboard/sidebar/dashboard-sidebar'
import { KauryLogout, KaurySpark } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-context'
import { usePathname } from 'next/navigation'
import { useReleaseNotification } from '@/hooks/utility/useReleaseNotification'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const { seen: novedadesSeen, hydrated } = useReleaseNotification()
  const showNovedadesDot = hydrated && !novedadesSeen

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-aurora" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60"
        style={{
          background:
            'radial-gradient(60% 100% at 20% 0%, rgba(139,92,246,0.18), transparent 70%), radial-gradient(50% 100% at 85% 0%, rgba(236,72,153,0.12), transparent 70%)',
        }}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className="group fixed left-0 top-0 z-50 h-full w-20 hover:w-64 transition-[width] duration-300 ease-smooth"
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="m-3 mr-0 h-[calc(100%-1.5rem)] glass-strong rounded-2xl shadow-card overflow-hidden">
          <DashboardSidebar isCollapsed={!isSidebarOpen} />
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="absolute left-20 right-0 top-0 bottom-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex-none">
          <div className="mx-3 mt-3 flex h-12 items-center justify-end gap-1.5 rounded-2xl glass shadow-soft px-3">
            <Link
              href="/novedades"
              className="relative hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-3 py-1.5 text-xs font-medium text-white shadow-pop transition-transform hover:scale-[1.02] active:scale-95"
            >
              <KaurySpark className="h-3.5 w-3.5" />
              Novedades
              {showNovedadesDot && (
                <>
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-400 animate-ping opacity-70" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-card" />
                </>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={logout}
              title="Cerrar sesión"
            >
              <KauryLogout className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          <div className="px-3 pb-6 pt-3">{children}</div>
        </main>
      </div>
    </div>
  )
}
