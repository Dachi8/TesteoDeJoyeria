"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CalendarIcon,
  Receipt,
  User,
  Edit,
  Trash2,
  Calculator,
  Wallet,
  History,
  TrendingDown,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useApp } from "@/contexts/app-context"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarInset } from "@/components/ui/sidebar"
import * as XLSX from "xlsx"

export default function VentasPage() {
  const { productos, ventas, retiros, addSale, updateSale, deleteSale, addWithdrawal, deleteWithdrawal, getStats } =
    useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCalculatorDialogOpen, setIsCalculatorDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [newSale, setNewSale] = useState({
    cliente: "",
    vendedor: "",
    productos: [],
    metodoPago: "",
  })
  const [selectedProduct, setSelectedProduct] = useState("")
  const [cantidad, setCantidad] = useState(1)

  // 💰 Estados para la calculadora de dinero
  const [moneyCalculator, setMoneyCalculator] = useState({
    cantidadRestar: "",
    concepto: "",
    tipoOperacion: "retiro" as "retiro" | "gasto",
  })

  const stats = getStats()

  // 💰 Calcular totales
  const totalVentasDinero = ventas.reduce((sum, sale) => sum + sale.total, 0)
  const totalRetirosDinero = retiros.reduce((sum, retiro) => sum + retiro.cantidad, 0)
  const dineroDisponible = totalVentasDinero - totalRetirosDinero

  const filteredSales = ventas.filter((sale) => {
    const matchesSearch =
      sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.vendedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.productos.some((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

    let matchesDate = true
    if (dateRange.from && dateRange.to) {
      const saleDate = new Date(sale.fecha)
      matchesDate = saleDate >= dateRange.from && saleDate <= dateRange.to
    }

    return matchesSearch && matchesDate
  })

  // 💰 Función para abrir calculadora
  const openCalculator = () => {
    setMoneyCalculator({
      cantidadRestar: "",
      concepto: "",
      tipoOperacion: "retiro",
    })
    setIsCalculatorDialogOpen(true)
  }

  // 💰 Función para procesar retiro/gasto
  const processWithdrawal = () => {
    const cantidad = Number.parseFloat(moneyCalculator.cantidadRestar)

    if (!cantidad || cantidad <= 0) {
      alert("Por favor ingresa una cantidad válida")
      return
    }

    if (cantidad > dineroDisponible) {
      if (
        !confirm(
          `La cantidad (${cantidad.toLocaleString()}) es mayor al dinero disponible (${dineroDisponible.toLocaleString()}). ¿Deseas continuar?`,
        )
      ) {
        return
      }
    }

    const withdrawal = {
      fecha: new Date().toISOString().split("T")[0],
      cantidad: cantidad,
      concepto:
        moneyCalculator.concepto ||
        `${moneyCalculator.tipoOperacion === "retiro" ? "Retiro" : "Gasto"} sin descripción`,
      tipo: moneyCalculator.tipoOperacion,
    }

    addWithdrawal(withdrawal)
    setIsCalculatorDialogOpen(false)
    setMoneyCalculator({
      cantidadRestar: "",
      concepto: "",
      tipoOperacion: "retiro",
    })
  }

  // 💰 Función para eliminar retiro
  const handleDeleteWithdrawal = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      deleteWithdrawal(id)
    }
  }

  const addProductToSale = () => {
    if (selectedProduct && cantidad > 0) {
      const product = productos.find((p) => p.id === Number.parseInt(selectedProduct))
      if (product && product.stock >= cantidad) {
        const existingProductIndex = newSale.productos.findIndex((p) => p.nombre === product.nombre)

        if (existingProductIndex >= 0) {
          const updatedProducts = [...newSale.productos]
          updatedProducts[existingProductIndex].cantidad += cantidad
          setNewSale({ ...newSale, productos: updatedProducts })
        } else {
          setNewSale({
            ...newSale,
            productos: [
              ...newSale.productos,
              {
                nombre: product.nombre,
                cantidad: cantidad,
                precio: product.precio,
                costo: product.costo,
              },
            ],
          })
        }
        setSelectedProduct("")
        setCantidad(1)
      } else {
        alert("Stock insuficiente para este producto")
      }
    }
  }

  const removeProductFromSale = (index) => {
    const updatedProducts = newSale.productos.filter((_, i) => i !== index)
    setNewSale({ ...newSale, productos: updatedProducts })
  }

  const calculateSaleTotal = () => {
    return newSale.productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0)
  }

  const calculateSaleProfit = () => {
    return newSale.productos.reduce((sum, p) => sum + (p.precio - p.costo) * p.cantidad, 0)
  }

  const handleAddSale = () => {
    if (newSale.cliente && newSale.vendedor && newSale.productos.length > 0 && newSale.metodoPago) {
      const sale = {
        fecha: new Date().toISOString().split("T")[0],
        cliente: newSale.cliente,
        vendedor: newSale.vendedor,
        productos: newSale.productos,
        total: calculateSaleTotal(),
        ganancia: calculateSaleProfit(),
        metodoPago: newSale.metodoPago,
      }
      addSale(sale)
      resetForm()
      setIsAddDialogOpen(false)
    }
  }

  const handleEditSale = (sale) => {
    setEditingSale(sale)
    setNewSale({
      cliente: sale.cliente,
      vendedor: sale.vendedor,
      productos: [...sale.productos],
      metodoPago: sale.metodoPago,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateSale = () => {
    if (editingSale && newSale.cliente && newSale.vendedor && newSale.productos.length > 0 && newSale.metodoPago) {
      const updatedSale = {
        cliente: newSale.cliente,
        vendedor: newSale.vendedor,
        productos: newSale.productos,
        total: calculateSaleTotal(),
        ganancia: calculateSaleProfit(),
        metodoPago: newSale.metodoPago,
      }
      updateSale(editingSale.id, updatedSale)
      resetForm()
      setIsEditDialogOpen(false)
      setEditingSale(null)
    }
  }

  const handleDeleteSale = (saleId) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.")) {
      deleteSale(saleId)
    }
  }

  const resetForm = () => {
    setNewSale({
      cliente: "",
      vendedor: "",
      productos: [],
      metodoPago: "",
    })
    setSelectedProduct("")
    setCantidad(1)
  }

  const exportToExcel = () => {
    const salesData = ventas.map((sale) => ({
      ID: sale.id,
      Fecha: sale.fecha,
      Cliente: sale.cliente,
      Vendedor: sale.vendedor || "Sin asignar",
      Productos: sale.productos.map((p) => `${p.nombre} (${p.cantidad})`).join(", "),
      Total: sale.total,
      Ganancia: sale.ganancia,
      "Método de Pago": sale.metodoPago,
    }))

    const worksheet = XLSX.utils.json_to_sheet(salesData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas")
    XLSX.writeFile(workbook, "reporte_ventas.xlsx")
  }

  return (
    <SidebarInset>
      <MobileHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Ventas</h1>
          <p className="text-muted-foreground text-sm md:text-base">Registra y analiza las ventas de ACCESORIOS A&V</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Ventas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">${totalVentasDinero.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalVentasDinero > 0 ? "Ingresos totales" : "Sin ventas"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Retiros</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-red-600">${totalRetirosDinero.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalRetirosDinero > 0 ? "Gastos y retiros" : "Sin retiros"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">💰 Disponible</CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg md:text-2xl font-bold ${dineroDisponible >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${dineroDisponible.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{dineroDisponible >= 0 ? "Dinero disponible" : "Déficit"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Ganancias</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">${stats.totalGanancias.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalGanancias > 0 ? "Margen de ganancia" : "Sin ganancias"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Ventas Hoy</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.ventasHoy}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ventasHoy > 0 ? "¡Día productivo!" : "Sin ventas hoy"}
              </p>
            </CardContent>
          </Card>

          {/* 💰 Tarjeta de calculadora mejorada */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Calculadora</CardTitle>
              <Calculator className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-primary">${dineroDisponible.toLocaleString()}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={openCalculator}
                className="mt-2 w-full text-xs bg-primary/10 border-primary/20 hover:bg-primary/20"
              >
                <Wallet className="mr-1 h-3 w-3" />
                Retirar/Gastar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 💰 Dialog de Calculadora Mejorada */}
        <Dialog open={isCalculatorDialogOpen} onOpenChange={setIsCalculatorDialogOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Gestión de Dinero
              </DialogTitle>
              <DialogDescription>Registra retiros, gastos y consulta el historial</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calculator">💰 Retirar/Gastar</TabsTrigger>
                <TabsTrigger value="history">📋 Historial</TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="space-y-6 py-4">
                {/* Resumen actual */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">💰 Total Ventas</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      ${totalVentasDinero.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 text-center">
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">📤 Total Retiros</div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">
                      ${totalRetirosDinero.toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border text-center ${
                      dineroDisponible >= 0
                        ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        dineroDisponible >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      🎯 Disponible
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        dineroDisponible >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      ${dineroDisponible.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Tipo de operación */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">🏷️ Tipo de Operación</Label>
                  <Select
                    value={moneyCalculator.tipoOperacion}
                    onValueChange={(value: "retiro" | "gasto") =>
                      setMoneyCalculator({ ...moneyCalculator, tipoOperacion: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retiro">💸 Retiro Personal</SelectItem>
                      <SelectItem value="gasto">🏪 Gasto de Tienda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cantidad a restar */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad-restar" className="text-sm font-medium">
                    💵 Cantidad a {moneyCalculator.tipoOperacion === "retiro" ? "Retirar" : "Gastar"}
                  </Label>
                  <Input
                    id="cantidad-restar"
                    type="number"
                    placeholder="0.00"
                    value={moneyCalculator.cantidadRestar}
                    onChange={(e) => setMoneyCalculator({ ...moneyCalculator, cantidadRestar: e.target.value })}
                    className="text-lg"
                  />
                </div>

                {/* Concepto */}
                <div className="space-y-2">
                  <Label htmlFor="concepto" className="text-sm font-medium">
                    📝 Concepto
                  </Label>
                  <Textarea
                    id="concepto"
                    placeholder={
                      moneyCalculator.tipoOperacion === "retiro"
                        ? "Ej: Retiro personal, Pago personal..."
                        : "Ej: Compra de materiales, Pago de servicios, Gastos de tienda..."
                    }
                    value={moneyCalculator.concepto}
                    onChange={(e) => setMoneyCalculator({ ...moneyCalculator, concepto: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Vista previa del resultado */}
                {moneyCalculator.cantidadRestar && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">📊 Vista Previa:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Dinero actual:</span>
                        <span className="font-medium">${dineroDisponible.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{moneyCalculator.tipoOperacion === "retiro" ? "Retiro:" : "Gasto:"}</span>
                        <span className="font-medium text-red-600">
                          -${Number.parseFloat(moneyCalculator.cantidadRestar || "0").toLocaleString()}
                        </span>
                      </div>
                      <hr className="my-1" />
                      <div className="flex justify-between font-bold">
                        <span>Quedará:</span>
                        <span
                          className={
                            dineroDisponible - Number.parseFloat(moneyCalculator.cantidadRestar || "0") >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          $
                          {(
                            dineroDisponible - Number.parseFloat(moneyCalculator.cantidadRestar || "0")
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">📋 Historial de Retiros y Gastos</Label>
                  {retiros.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {retiros
                        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                        .map((retiro) => (
                          <div
                            key={retiro.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{retiro.tipo === "retiro" ? "💸" : "🏪"}</span>
                                <span className="font-medium text-sm">${retiro.cantidad.toLocaleString()}</span>
                                <Badge variant={retiro.tipo === "retiro" ? "secondary" : "outline"} className="text-xs">
                                  {retiro.tipo === "retiro" ? "Retiro" : "Gasto"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-1">{retiro.concepto}</p>
                              <p className="text-xs text-muted-foreground">{retiro.fecha}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWithdrawal(retiro.id)}
                              className="text-red-600 hover:text-red-700 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="mx-auto h-12 w-12 mb-2" />
                      <p className="text-sm">No hay retiros o gastos registrados</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCalculatorDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={processWithdrawal}
                disabled={!moneyCalculator.cantidadRestar || Number.parseFloat(moneyCalculator.cantidadRestar) <= 0}
                className="bg-primary hover:bg-primary/90"
              >
                ✅ Confirmar {moneyCalculator.tipoOperacion === "retiro" ? "Retiro" : "Gasto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, vendedor o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={exportToExcel}
              variant="outline"
              disabled={ventas.length === 0}
              className="flex-1 sm:flex-none bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none" onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Venta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Venta</DialogTitle>
                  <DialogDescription>Completa la información de la venta</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cliente">Cliente</Label>
                      <Input
                        id="cliente"
                        value={newSale.cliente}
                        onChange={(e) => setNewSale({ ...newSale, cliente: e.target.value })}
                        placeholder="Nombre del cliente"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="vendedor">Vendedor</Label>
                      <Input
                        id="vendedor"
                        value={newSale.vendedor}
                        onChange={(e) => setNewSale({ ...newSale, vendedor: e.target.value })}
                        placeholder="Nombre del vendedor"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Agregar Productos</Label>
                    <div className="flex gap-2">
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos
                            .filter((product) => product.stock > 0)
                            .map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.nombre} - ${product.precio} (Stock: {product.stock})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={cantidad}
                          onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                          className="w-20"
                          placeholder="Cant."
                        />
                        <Button onClick={addProductToSale} type="button" className="px-4">
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {newSale.productos.length > 0 && (
                    <div className="grid gap-2">
                      <Label>Productos Seleccionados</Label>
                      <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                        {newSale.productos.map((product, index) => (
                          <div key={index} className="flex justify-between items-center py-1">
                            <span className="text-sm">
                              {product.nombre} x{product.cantidad} - $
                              {(product.precio * product.cantidad).toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProductFromSale(index)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">Total: ${calculateSaleTotal().toLocaleString()}</div>
                        <div className="text-sm text-green-600">
                          Ganancia: ${calculateSaleProfit().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="metodoPago">Método de Pago</Label>
                    <Select
                      value={newSale.metodoPago}
                      onValueChange={(value) => setNewSale({ ...newSale, metodoPago: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddSale}
                    disabled={newSale.productos.length === 0 || !newSale.cliente || !newSale.vendedor}
                  >
                    Registrar Venta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dialog para editar ventas */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Venta</DialogTitle>
              <DialogDescription>Modifica la información de la venta</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-cliente">Cliente</Label>
                  <Input
                    id="edit-cliente"
                    value={newSale.cliente}
                    onChange={(e) => setNewSale({ ...newSale, cliente: e.target.value })}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-vendedor">Vendedor</Label>
                  <Input
                    id="edit-vendedor"
                    value={newSale.vendedor}
                    onChange={(e) => setNewSale({ ...newSale, vendedor: e.target.value })}
                    placeholder="Nombre del vendedor"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Agregar Productos</Label>
                <div className="flex gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos
                        .filter((product) => product.stock > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.nombre} - ${product.precio} (Stock: {product.stock})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                      className="w-20"
                      placeholder="Cant."
                    />
                    <Button onClick={addProductToSale} type="button" className="px-4">
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>

              {newSale.productos.length > 0 && (
                <div className="grid gap-2">
                  <Label>Productos Seleccionados</Label>
                  <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                    {newSale.productos.map((product, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm">
                          {product.nombre} x{product.cantidad} - ${(product.precio * product.cantidad).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProductFromSale(index)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-medium">Total: ${calculateSaleTotal().toLocaleString()}</div>
                    <div className="text-sm text-green-600">Ganancia: ${calculateSaleProfit().toLocaleString()}</div>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-metodoPago">Método de Pago</Label>
                <Select
                  value={newSale.metodoPago}
                  onValueChange={(value) => setNewSale({ ...newSale, metodoPago: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpdateSale}
                disabled={newSale.productos.length === 0 || !newSale.cliente || !newSale.vendedor}
              >
                Actualizar Venta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>
              {ventas.length > 0 ? `${filteredSales.length} ventas encontradas` : "No hay ventas registradas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ventas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Fecha</TableHead>
                      <TableHead className="min-w-[120px]">Cliente</TableHead>
                      <TableHead className="min-w-[100px]">Vendedor</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[150px]">Productos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="hidden md:table-cell">Ganancia</TableHead>
                      <TableHead className="hidden sm:table-cell">Método</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="text-sm">{sale.fecha}</TableCell>
                        <TableCell className="font-medium">{sale.cliente}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {sale.vendedor || "Sin asignar"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm">
                            {sale.productos.map((p, i) => (
                              <div key={i}>
                                {p.nombre} ({p.cantidad})
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${sale.total.toLocaleString()}</TableCell>
                        <TableCell className="hidden md:table-cell text-green-600 font-medium">
                          ${sale.ganancia.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{sale.metodoPago}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditSale(sale)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No hay ventas registradas</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Comienza registrando tu primera venta para ver las estadísticas
                </p>
                <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Primera Venta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
