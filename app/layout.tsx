import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ACCESORIOS A&V - Sistema de Inventario",
  description: "Sistema completo de gestión de inventario para ACCESORIOS A&V",
  icons: {
    icon: "/images/logo-av.jpg",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} storageKey="jewelry-theme">
          <AppProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </SidebarProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
