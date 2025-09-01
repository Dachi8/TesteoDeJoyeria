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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Download, Package, DollarSign } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarInset } from "@/components/ui/sidebar"
import * as XLSX from "xlsx"

const categorias = ["Anillos", "Collares", "Aretes", "Pulseras", "Relojes", "Otros"]

export default function ProductosPage() {
  const { productos, addProduct, updateProduct, deleteProduct } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    costo: "",
    stock: "",
    descripcion: "",
    proveedor: "",
  })

  const filteredProducts = productos.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    if (newProduct.nombre && newProduct.categoria && newProduct.precio) {
      const product = {
        ...newProduct,
        precio: Number.parseFloat(newProduct.precio),
        costo: Number.parseFloat(newProduct.costo) || 0,
        stock: Number.parseInt(newProduct.stock) || 0,
        fechaIngreso: new Date().toISOString().split("T")[0],
      }
      addProduct(product)
      setNewProduct({
        nombre: "",
        categoria: "",
        precio: "",
        costo: "",
        stock: "",
        descripcion: "",
        proveedor: "",
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setNewProduct({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: product.precio.toString(),
      costo: product.costo.toString(),
      stock: product.stock.toString(),
      descripcion: product.descripcion,
      proveedor: product.proveedor,
    })
  }

  const handleUpdateProduct = () => {
    if (editingProduct && newProduct.nombre && newProduct.categoria && newProduct.precio) {
      updateProduct(editingProduct.id, {
        ...newProduct,
        precio: Number.parseFloat(newProduct.precio),
        costo: Number.parseFloat(newProduct.costo) || 0,
        stock: Number.parseInt(newProduct.stock) || 0,
      })
      setEditingProduct(null)
      setNewProduct({
        nombre: "",
        categoria: "",
        precio: "",
        costo: "",
        stock: "",
        descripcion: "",
        proveedor: "",
      })
    }
  }

  const handleDeleteProduct = (id) => {
    deleteProduct(id)
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      productos.map((p) => ({
        ID: p.id,
        Nombre: p.nombre,
        Categoría: p.categoria,
        Precio: p.precio,
        Costo: p.costo,
        Ganancia: p.precio - p.costo,
        Stock: p.stock,
        Descripción: p.descripcion,
        Proveedor: p.proveedor,
        "Fecha Ingreso": p.fechaIngreso,
      })),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")
    XLSX.writeFile(workbook, "inventario_productos.xlsx")
  }

  const totalValue = productos.reduce((sum, p) => sum + p.precio * p.stock, 0)
  const totalCost = productos.reduce((sum, p) => sum + p.costo * p.stock, 0)
  const totalProfit = totalValue - totalCost

  return (
    <SidebarInset>
      <MobileHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventario de Productos</h1>
          <p className="text-muted-foreground text-sm md:text-base">Gestiona el inventario de ACCESORIOS A&V</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganancia Potencial</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">${totalProfit.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{productos.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={exportToExcel} variant="outline" className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] mx-4">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                  <DialogDescription>Completa la información del producto</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newProduct.nombre}
                      onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={newProduct.categoria}
                      onValueChange={(value) => setNewProduct({ ...newProduct, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="precio">Precio</Label>
                      <Input
                        id="precio"
                        type="number"
                        value={newProduct.precio}
                        onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="costo">Costo</Label>
                      <Input
                        id="costo"
                        type="number"
                        value={newProduct.costo}
                        onChange={(e) => setNewProduct({ ...newProduct, costo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Input
                      id="proveedor"
                      value={newProduct.proveedor}
                      onChange={(e) => setNewProduct({ ...newProduct, proveedor: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newProduct.descripcion}
                      onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProduct}>Agregar Producto</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>{filteredProducts.length} productos encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Producto</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="hidden md:table-cell">Costo</TableHead>
                    <TableHead className="hidden md:table-cell">Ganancia</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden sm:table-cell">Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.nombre}</div>
                          <div className="text-sm text-muted-foreground sm:hidden">{product.categoria}</div>
                          <div className="text-sm text-muted-foreground">{product.proveedor}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{product.categoria}</TableCell>
                      <TableCell>${product.precio.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell">${product.costo.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell text-green-600">
                        ${(product.precio - product.costo).toLocaleString()}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={product.stock > 10 ? "default" : product.stock > 5 ? "secondary" : "destructive"}
                        >
                          {product.stock > 10 ? "En Stock" : product.stock > 5 ? "Stock Bajo" : "Crítico"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] mx-4">
                              <DialogHeader>
                                <DialogTitle>Editar Producto</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-nombre">Nombre</Label>
                                  <Input
                                    id="edit-nombre"
                                    value={newProduct.nombre}
                                    onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-categoria">Categoría</Label>
                                  <Select
                                    value={newProduct.categoria}
                                    onValueChange={(value) => setNewProduct({ ...newProduct, categoria: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categorias.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                          {cat}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-precio">Precio</Label>
                                    <Input
                                      id="edit-precio"
                                      type="number"
                                      value={newProduct.precio}
                                      onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-costo">Costo</Label>
                                    <Input
                                      id="edit-costo"
                                      type="number"
                                      value={newProduct.costo}
                                      onChange={(e) => setNewProduct({ ...newProduct, costo: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-stock">Stock</Label>
                                  <Input
                                    id="edit-stock"
                                    type="number"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleUpdateProduct}>Actualizar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
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
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
