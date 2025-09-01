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
import { Plus, Search, Edit, Trash2, Eye, ShoppingCart, Package, Camera, X } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarInset } from "@/components/ui/sidebar"
import Image from "next/image"

const categorias = ["Anillos", "Collares", "Aretes", "Pulseras", "Relojes", "Otros"]

export default function CatalogoPage() {
  const { productos, addProduct, updateProduct, deleteProduct } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    costo: "",
    stock: "",
    descripcion: "",
    proveedor: "",
    imagen: "",
  })
  const [imagePreview, setImagePreview] = useState("")

  const filteredProducts = productos.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setImagePreview(imageUrl)
        setNewProduct({ ...newProduct, imagen: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImagePreview("")
    setNewProduct({ ...newProduct, imagen: "" })
  }

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
      resetForm()
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
      imagen: product.imagen || "",
    })
    setImagePreview(product.imagen || "")
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
      resetForm()
    }
  }

  const handleDeleteProduct = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      deleteProduct(id)
    }
  }

  const handleViewProduct = (product) => {
    setViewingProduct(product)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setNewProduct({
      nombre: "",
      categoria: "",
      precio: "",
      costo: "",
      stock: "",
      descripcion: "",
      proveedor: "",
      imagen: "",
    })
    setImagePreview("")
  }

  const getStockStatus = (stock) => {
    if (stock > 10) return { label: "En Stock", variant: "default" as const }
    if (stock > 5) return { label: "Stock Bajo", variant: "secondary" as const }
    if (stock > 0) return { label: "Crítico", variant: "destructive" as const }
    return { label: "Agotado", variant: "destructive" as const }
  }

  return (
    <SidebarInset>
      <MobileHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
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
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
              <p className="text-muted-foreground text-sm md:text-base">Explora la colección de ACCESORIOS A&V</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Imagen</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productos.filter((p) => p.imagen).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Stock</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productos.filter((p) => p.stock > 0).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(productos.map((p) => p.categoria)).size}</div>
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

          <div className="flex justify-end">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                  <DialogDescription>Completa la información del producto e incluye una imagen</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Image Upload */}
                  <div className="grid gap-2">
                    <Label>Imagen del Producto</Label>
                    <div className="flex flex-col gap-2">
                      {imagePreview ? (
                        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                          <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={clearImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Haz clic para subir una imagen</p>
                        </div>
                      )}
                      <Input type="file" accept="image/*" onChange={handleImageUpload} className="cursor-pointer" />
                    </div>
                  </div>

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

        {/* Products Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock)
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  {product.imagen ? (
                    <Image
                      src={product.imagen || "/placeholder.svg"}
                      alt={product.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{product.nombre}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.descripcion}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">${product.precio.toLocaleString()}</span>
                    <Badge variant="outline">{product.categoria}</Badge>
                  </div>

                  <div className="flex justify-center">
                    <span className="text-sm text-muted-foreground">Stock: {product.stock} unidades</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewProduct(product)}>
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Producto</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {/* Image Upload for Edit */}
                          <div className="grid gap-2">
                            <Label>Imagen del Producto</Label>
                            <div className="flex flex-col gap-2">
                              {imagePreview ? (
                                <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                                  <Image
                                    src={imagePreview || "/placeholder.svg"}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={clearImage}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                  <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                                  <p className="mt-2 text-sm text-muted-foreground">Haz clic para subir una imagen</p>
                                </div>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="cursor-pointer"
                              />
                            </div>
                          </div>

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
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No se encontraron productos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || selectedCategory !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando tu primer producto al catálogo"}
            </p>
          </div>
        )}

        {/* View Product Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px] mx-4">
            {viewingProduct && (
              <>
                <DialogHeader>
                  <DialogTitle>{viewingProduct.nombre}</DialogTitle>
                  <DialogDescription>{viewingProduct.categoria}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {viewingProduct.imagen && (
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                      <Image
                        src={viewingProduct.imagen || "/placeholder.svg"}
                        alt={viewingProduct.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Precio:</span>
                      <span className="text-2xl font-bold text-primary">${viewingProduct.precio.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium">Stock:</span>
                      <Badge variant={getStockStatus(viewingProduct.stock).variant}>
                        {viewingProduct.stock} unidades
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium">Proveedor:</span>
                      <span>{viewingProduct.proveedor}</span>
                    </div>

                    {viewingProduct.descripcion && (
                      <div>
                        <span className="font-medium">Descripción:</span>
                        <p className="mt-1 text-sm text-muted-foreground">{viewingProduct.descripcion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>
  )
}
