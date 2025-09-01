"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, TrendingUp, CalendarIcon, BarChart3, PieChart, User, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useApp } from "@/contexts/app-context"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarInset } from "@/components/ui/sidebar"
import * as XLSX from "xlsx"

export default function ReportesPage() {
  const { ventas, productos, getSalesData, getVendedoresStats } = useApp()
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [dateRange, setDateRange] = useState({ from: null, to: null })

  const salesData = getSalesData()
  const vendedoresStats = getVendedoresStats() // ✨ Obtener estadísticas por vendedor
  const totalVentas = ventas.reduce((sum, sale) => sum + sale.total, 0)
  const totalGanancias = ventas.reduce((sum, sale) => sum + sale.ganancia, 0)
  const margenPromedio = totalVentas > 0 ? ((totalGanancias / totalVentas) * 100).toFixed(1) : "0"

  const exportReport = (reportType) => {
    let data = []
    let filename = ""

    switch (reportType) {
      case "monthly":
        data = salesData
        filename = "reporte_mensual.xlsx"
        break
      case "sales":
        data = ventas.map((sale) => ({
          ID: sale.id,
          Fecha: sale.fecha,
          Cliente: sale.cliente,
          Vendedor: sale.vendedor || "Sin asignar", // ✨ Incluir vendedor
          Productos: sale.productos.map((p) => `${p.nombre} (${p.cantidad})`).join(", "),
          Total: sale.total,
          Ganancia: sale.ganancia,
          "Método de Pago": sale.metodoPago,
        }))
        filename = "reporte_ventas.xlsx"
        break
      case "products":
        data = productos.map((p) => ({
          ID: p.id,
          Nombre: p.nombre,
          Categoría: p.categoria,
          Precio: p.precio,
          Costo: p.costo,
          Stock: p.stock,
          Proveedor: p.proveedor,
        }))
        filename = "reporte_productos.xlsx"
        break
      case "vendedores": // ✨ Nuevo reporte de vendedores
        data = vendedoresStats.map((v) => ({
          Vendedor: v.nombre,
          "Total Ventas": v.totalVentas,
          "Total Ganancias": v.totalGanancias,
          "Número de Ventas": v.numeroVentas,
          "Promedio por Venta": v.numeroVentas > 0 ? (v.totalVentas / v.numeroVentas).toFixed(2) : 0,
        }))
        filename = "reporte_vendedores.xlsx"
        break
      default:
        return
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte")
    XLSX.writeFile(workbook, filename)
  }

  return (
    <SidebarInset>
      <MobileHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Analiza el rendimiento de ACCESORIOS A&V con reportes detallados
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último año</SelectItem>
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[280px] justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM", { locale: es })} -{" "}
                        {format(dateRange.to, "dd/MM", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: es })
                    )
                  ) : (
                    <span>Seleccionar fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Ventas Totales</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">${totalVentas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {ventas.length > 0 ? "Activo" : "Sin datos"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Ganancias Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">${totalGanancias.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Margen promedio: {margenPromedio}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Productos Vendidos</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {ventas.reduce((sum, sale) => sum + sale.productos.reduce((pSum, p) => pSum + p.cantidad, 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Unidades totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Vendedores Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{vendedoresStats.length}</div>
              <p className="text-xs text-muted-foreground">Con ventas registradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="ventas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="vendedores">Vendedores</TabsTrigger> {/* ✨ Nueva pestaña */}
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="ventas" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reporte de Ventas</CardTitle>
                  <CardDescription>Historial completo de transacciones</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport("sales")}
                  disabled={ventas.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                {ventas.length > 0 ? (
                  <div className="space-y-4">
                    {ventas.slice(0, 10).map((sale) => (
                      <div
                        key={sale.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{sale.cliente}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {sale.vendedor || "Sin asignar"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sale.productos.map((p) => `${p.nombre} (${p.cantidad})`).join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground">{sale.fecha}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${sale.total.toLocaleString()}</p>
                          <p className="text-sm text-green-600">Ganancia: ${sale.ganancia.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {ventas.length > 10 && (
                      <p className="text-center text-sm text-muted-foreground">Y {ventas.length - 10} ventas más...</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No hay ventas registradas para generar reportes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reporte de Productos</CardTitle>
                  <CardDescription>Inventario y rendimiento por producto</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportReport("products")}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productos.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{product.nombre}</p>
                        <p className="text-sm text-muted-foreground">{product.categoria}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.precio.toLocaleString()}</p>
                        <p className="text-sm text-green-600">
                          Ganancia: ${(product.precio - product.costo).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✨ Nueva pestaña de vendedores */}
          <TabsContent value="vendedores" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reporte de Vendedores</CardTitle>
                  <CardDescription>Rendimiento y estadísticas por vendedor</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport("vendedores")}
                  disabled={vendedoresStats.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                {vendedoresStats.length > 0 ? (
                  <div className="space-y-4">
                    {vendedoresStats.map((vendedor, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2"
                      >
                        <div className="space-y-1">
                          <p className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            {vendedor.nombre}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vendedor.numeroVentas} venta{vendedor.numeroVentas !== 1 ? "s" : ""} registrada
                            {vendedor.numeroVentas !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Promedio por venta: $
                            {vendedor.numeroVentas > 0
                              ? (vendedor.totalVentas / vendedor.numeroVentas).toFixed(0)
                              : "0"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${vendedor.totalVentas.toLocaleString()}</p>
                          <p className="text-sm text-green-600">
                            Ganancia: ${vendedor.totalGanancias.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No hay datos de vendedores para mostrar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen General</CardTitle>
                <CardDescription>Vista general del negocio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Estadísticas de Ventas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total de ventas:</span>
                        <span className="font-medium">${totalVentas.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total de ganancias:</span>
                        <span className="font-medium text-green-600">${totalGanancias.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Número de transacciones:</span>
                        <span className="font-medium">{ventas.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Ticket promedio:</span>
                        <span className="font-medium">
                          ${ventas.length > 0 ? (totalVentas / ventas.length).toFixed(0) : "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Vendedores activos:</span>
                        <span className="font-medium">{vendedoresStats.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Estadísticas de Inventario</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total de productos:</span>
                        <span className="font-medium">{productos.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Valor del inventario:</span>
                        <span className="font-medium">
                          ${productos.reduce((sum, p) => sum + p.precio * p.stock, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Productos con stock bajo:</span>
                        <span className="font-medium text-orange-600">
                          {productos.filter((p) => p.stock <= 5).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Margen promedio:</span>
                        <span className="font-medium">{margenPromedio}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
