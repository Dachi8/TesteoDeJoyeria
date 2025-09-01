"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, Upload, Download, Trash2, Plus, Settings, Store, Bell, Database, Shield } from "lucide-react"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarInset } from "@/components/ui/sidebar"

export default function ConfiguracionPage() {
  const [storeInfo, setStoreInfo] = useState({
    nombre: "ACCESORIOS A&V",
    direccion: "Av. Principal 123, Ciudad",
    telefono: "+1 234 567 8900",
    email: "info@accesoriosav.com",
    website: "www.accesoriosav.com",
  })

  const [notifications, setNotifications] = useState({
    stockBajo: true,
    nuevaVenta: true,
    reporteDiario: false,
    backupAutomatico: true,
  })

  const [categories, setCategories] = useState(["Anillos", "Collares", "Aretes", "Pulseras", "Relojes", "Otros"])
  const [newCategory, setNewCategory] = useState("")

  const handleSaveStoreInfo = () => {
    console.log("Guardando información de la tienda:", storeInfo)
  }

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (category) => {
    setCategories(categories.filter((c) => c !== category))
  }

  const exportData = () => {
    console.log("Exportando datos...")
  }

  const importData = () => {
    console.log("Importando datos...")
  }

  const createBackup = () => {
    console.log("Creando backup...")
  }

  return (
    <SidebarInset>
      <MobileHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground text-sm md:text-base">Personaliza y configura tu sistema de inventario</p>
        </div>

        <Tabs defaultValue="tienda" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="tienda">Tienda</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
            <TabsTrigger value="notificaciones">Alertas</TabsTrigger>
            <TabsTrigger value="datos">Datos</TabsTrigger>
          </TabsList>

          <TabsContent value="tienda" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información de la Tienda
                </CardTitle>
                <CardDescription>Configura los datos básicos de tu joyería</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Tienda</Label>
                    <Input
                      id="nombre"
                      value={storeInfo.nombre}
                      onChange={(e) => setStoreInfo({ ...storeInfo, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={storeInfo.telefono}
                      onChange={(e) => setStoreInfo({ ...storeInfo, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={storeInfo.direccion}
                    onChange={(e) => setStoreInfo({ ...storeInfo, direccion: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={storeInfo.email}
                      onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={storeInfo.website}
                      onChange={(e) => setStoreInfo({ ...storeInfo, website: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveStoreInfo} className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Información
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gestión de Categorías
                </CardTitle>
                <CardDescription>Administra las categorías de productos de tu inventario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Nueva categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Categorías Actuales</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        {category}
                        <button onClick={() => handleRemoveCategory(category)} className="ml-1 hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificaciones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>Personaliza las alertas y notificaciones del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerta de Stock Bajo</Label>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones cuando el stock esté bajo</p>
                  </div>
                  <Switch
                    checked={notifications.stockBajo}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, stockBajo: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificación de Nueva Venta</Label>
                    <p className="text-sm text-muted-foreground">Alerta inmediata cuando se registre una venta</p>
                  </div>
                  <Switch
                    checked={notifications.nuevaVenta}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, nuevaVenta: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reporte Diario</Label>
                    <p className="text-sm text-muted-foreground">Resumen diario de ventas y actividad</p>
                  </div>
                  <Switch
                    checked={notifications.reporteDiario}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, reporteDiario: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Respaldo automático de datos cada 24 horas</p>
                  </div>
                  <Switch
                    checked={notifications.backupAutomatico}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, backupAutomatico: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Exportar Datos
                  </CardTitle>
                  <CardDescription>Descarga una copia de seguridad de todos tus datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Exporta todos los datos de productos, ventas y configuración en formato Excel.
                  </p>
                  <Button onClick={exportData} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Todos los Datos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Importar Datos
                  </CardTitle>
                  <CardDescription>Restaura datos desde un archivo de respaldo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Importa datos desde un archivo Excel previamente exportado.
                  </p>
                  <Button onClick={importData} variant="outline" className="w-full bg-transparent">
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar Archivo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Backup Manual
                  </CardTitle>
                  <CardDescription>Crea un respaldo inmediato de la base de datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Genera un backup completo de la base de datos actual.</p>
                  <Button onClick={createBackup} variant="outline" className="w-full bg-transparent">
                    <Database className="mr-2 h-4 w-4" />
                    Crear Backup
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
                  <CardDescription>Acciones irreversibles - usar con precaución</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Eliminar todos los datos del sistema. Esta acción no se puede deshacer.
                  </p>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Resetear Sistema
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
