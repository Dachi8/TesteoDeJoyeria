"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, Gem, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
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

export function Sidebar() {
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

  // Render a placeholder during SSR and initial client render
  if (!mounted) {
    return (
      <div className="flex h-full w-64 flex-col border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Gem className="h-6 w-6 text-primary" />
            <span className="text-lg">JoyeríaApp</span>
          </div>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-2", isActive && "bg-secondary")}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Moon className="h-4 w-4" />
            <span>Cambiar tema</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Gem className="h-6 w-6 text-primary" />
          <span className="text-lg">JoyeríaApp</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-2", isActive && "bg-secondary")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Theme Toggle */}
      <div className="border-t p-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start gap-2">
          {resolvedTheme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>Modo Oscuro</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
