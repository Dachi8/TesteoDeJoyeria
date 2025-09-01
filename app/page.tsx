"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, DollarSign, ShoppingCart, AlertTriangle } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarInset } from "@/components/ui/sidebar"
import Image from "next/image"

// Simple Chart Components con colores elegantes
function SimpleLineChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.ventas || 1, d.ganancias || 1)), 1)

  return (
    <div className="w-full h-64 md:h-80 p-2 md:p-4">
      <div className="flex justify-between items-end h-48 md:h-64 border-b border-l border-border">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-1 md:space-y-2 flex-1">
            <div className="flex flex-col items-center space-y-1 h-full justify-end">
              <div
                className="w-4 md:w-8 bg-primary rounded-t elegant-shadow"
                style={{ height: `${Math.max((item.ventas / maxValue) * 150, 2)}px` }}
                title={`Ventas: $${item.ventas.toLocaleString()}`}
              />
              <div
                className="w-4 md:w-8 bg-foreground rounded-t elegant-shadow"
                style={{ height: `${Math.max((item.ganancias / maxValue) * 150, 2)}px` }}
                title={`Ganancias: $${item.ganancias.toLocaleString()}`}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-2 md:space-x-4 mt-2 md:mt-4">
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded"></div>
          <span className="text-xs md:text-sm text-foreground">Ventas</span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-foreground rounded"></div>
          <span className="text-xs md:text-sm text-foreground">Ganancias</span>
        </div>
      </div>
    </div>
  )
}

function SimplePieChart({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No hay datos para mostrar</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const colors = ["hsl(var(--primary))", "hsl(var(--foreground))", "#B8860B", "#FFD700", "#FFA500", "#DAA520"]

  return (
    <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center p-2 md:p-4">
      <div className="relative w-32 h-32 md:w-48 md:h-48">
        <svg width="100%" height="100%" className="transform -rotate-90" viewBox="0 0 192 192">
          {data.map((item, index) => {
            const percentage = item.value / total
            const angle = percentage * 360
            const startAngle = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0)

            const x1 = 96 + 80 * Math.cos((startAngle * Math.PI) / 180)
            const y1 = 96 + 80 * Math.sin((startAngle * Math.PI) / 180)
            const x2 = 96 + 80 * Math.cos(((startAngle + angle) * Math.PI) / 180)
            const y2 = 96 + 80 * Math.sin(((startAngle + angle) * Math.PI) / 180)

            const largeArcFlag = angle > 180 ? 1 : 0
            const pathData = `M 96 96 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
            )
          })}
        </svg>
      </div>
      <div className="mt-2 md:mt-4 grid grid-cols-2 gap-1 md:gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-1 md:space-x-2">
            <div
              className="w-2 h-2 md:w-3 md:h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-foreground">
              {item.name} ({item.value}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { getStats, getSalesData, getCategoryData, getRecentSales, getLowStockItems } = useApp()

  const stats = getStats()
  const salesData = getSalesData()
  const categoryData = getCategoryData()
  const recentSales = getRecentSales()
  const lowStockItems = getLowStockItems()

  return (
    <SidebarInset>
      <MobileHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header con Logo */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-av.jpg"
              alt="ACCESORIOS A&V Logo"
              width={48}
              height={48}
              className="object-cover rounded-lg elegant-shadow"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">Resumen general de ACCESORIOS A&V</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="elegant-shadow hover:elegant-shadow-lg transition-shadow border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-foreground">Ventas Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">${stats.totalVentas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalVentas > 0 ? "¡Excelente trabajo!" : "Registra tu primera venta"}
              </p>
            </CardContent>
          </Card>

          <Card className="elegant-shadow hover:elegant-shadow-lg transition-shadow border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-foreground">Ganancias</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-primary">${stats.totalGanancias.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalGanancias > 0 ? "Margen de ganancia activo" : "Sin ganancias registradas"}
              </p>
            </CardContent>
          </Card>

          <Card className="elegant-shadow hover:elegant-shadow-lg transition-shadow border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-foreground">Productos</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">{stats.totalProductos}</div>
              <p className="text-xs text-muted-foreground">Productos en inventario</p>
            </CardContent>
          </Card>

          <Card className="elegant-shadow hover:elegant-shadow-lg transition-shadow border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-foreground">Ventas Hoy</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-foreground">{stats.ventasHoy}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ventasHoy > 0 ? "¡Día productivo!" : "Aún no hay ventas hoy"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 elegant-shadow border-border">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-foreground">Ventas y Ganancias Mensuales</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {stats.totalVentas > 0 ? "Evolución de tus ventas" : "Los gráficos se actualizarán con tus ventas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleLineChart data={salesData} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 elegant-shadow border-border">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-foreground">Productos por Categoría</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Distribución de tu inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <SimplePieChart data={categoryData} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 elegant-shadow border-border">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-foreground">Ventas Recientes</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {recentSales.length > 0 ? "Últimas transacciones realizadas" : "No hay ventas registradas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSales.length > 0 ? (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-medium leading-none truncate text-foreground">
                          {sale.productos.map((p) => p.nombre).join(", ")}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{sale.cliente}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-medium text-primary">${sale.total.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{sale.fecha}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Registra tu primera venta para ver la actividad aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 elegant-shadow border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-foreground">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Stock Bajo
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Productos que necesitan reposición
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-medium leading-none truncate text-foreground">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">Stock mínimo recomendado: 5</p>
                      </div>
                      <Badge
                        variant={item.stock <= 2 ? "destructive" : "secondary"}
                        className={`ml-2 ${item.stock <= 2 ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
                      >
                        {item.stock} restantes
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    ¡Excelente! Todos los productos tienen stock suficiente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
