"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, Moon, Sun, Grid3X3 } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Catálogo",
    href: "/catalogo",
    icon: Grid3X3,
  },
  {
    name: "Productos",
    href: "/productos",
    icon: Package,
  },
  {
    name: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
  },
  {
    name: "Reportes",
    href: "/reportes",
    icon: BarChart3,
  },
  {
    name: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Sidebar variant="inset" className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-accent">
              <Link href="/">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden bg-background">
                  <Image
                    src="/images/logo-av.jpg"
                    alt="ACCESORIOS A&V Logo"
                    width={40}
                    height={40}
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-foreground">ACCESORIOS A&V</span>
                  <span className="truncate text-xs text-muted-foreground">Gestión de Inventario</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        hover:bg-accent hover:text-accent-foreground
                        ${isActive ? "bg-primary text-primary-foreground font-medium" : ""}
                      `}
                    >
                      <Link href={item.href}>
                        <item.icon className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
                        <span className={isActive ? "text-primary-foreground" : "text-foreground"}>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} className="hover:bg-accent hover:text-accent-foreground">
              {mounted && resolvedTheme === "dark" ? (
                <>
                  <Sun className="text-primary" />
                  <span className="text-foreground">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="text-primary" />
                  <span className="text-foreground">Modo Oscuro</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
