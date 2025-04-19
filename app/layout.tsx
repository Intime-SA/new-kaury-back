import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout"
import { Toaster } from "@/components/ui/toaster"

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: "Kaury Dashboard | Sistema de Gestión Empresarial",
  description: "Dashboard empresarial para gestión de e-commerce",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
