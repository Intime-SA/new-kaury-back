import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { Providers } from "../providers/providers"
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/providers/theme-provider"

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: "Kaury - Dashboard",
  description: "Dashboard empresarial para gestión de e-commerce",
  generator: 'v0.dev',
  openGraph: {
    type: 'website',
    title: 'Mayorista Kaury - Vendedor Numero 1 de Argentina',
    description: 'Descubre la mejor colección de lencería y ropa íntima en Kaury. Calidad, estilo y comodidad en cada prenda.',
    url: 'https://kaury.com.ar',
    siteName: 'Kaury',
    images: [
      {
        url: 'https://kaury.com.ar/kaury_logo_19.svg',
        width: 1200,
        height: 630,
        type: 'image/svg+xml',
        alt: 'Kaury - Mayorista de Lencería',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/kaury_logo_19.svg', type: 'image/svg+xml' },
      { url: '/descarga.png', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/descarga.png', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#000000',
  },
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
        
        {/* Favicon y iconos */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#000000" />
        
        {/* Google Analytics (reemplaza con tu ID real) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            <DashboardLayout>
              {children}
            </DashboardLayout>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
