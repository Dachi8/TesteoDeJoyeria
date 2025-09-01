"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Key, User, Shield, Briefcase } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showMasterKey, setShowMasterKey] = useState(false)

  // Estados para formularios
  const [propietarioForm, setPropietarioForm] = useState({
    usuario: "",
    password: "",
    llavePropietario: "",
  })

  const [empleadoForm, setEmpleadoForm] = useState({
    usuario: "",
    password: "",
  })

  const handlePropietarioLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login({
        usuario: propietarioForm.usuario,
        password: propietarioForm.password,
        llavePropietario: propietarioForm.llavePropietario,
      })

      if (success) {
        router.push("/")
      } else {
        setError("Credenciales incorrectas o llave maestra inválida")
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmpleadoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login({
        usuario: empleadoForm.usuario,
        password: empleadoForm.password,
      })

      if (success) {
        router.push("/")
      } else {
        setError("Credenciales incorrectas")
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md elegant-shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logo-av.jpg"
              alt="ACCESORIOS A&V Logo"
              width={80}
              height={80}
              className="object-cover rounded-lg elegant-shadow"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">ACCESORIOS A&V</CardTitle>
            <CardDescription className="text-muted-foreground">Sistema de Gestión de Inventario</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="empleado" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="empleado" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Empleado
              </TabsTrigger>
              <TabsTrigger value="propietario" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Propietario
              </TabsTrigger>
            </TabsList>

            {/* Login de Empleado */}
            <TabsContent value="empleado" className="space-y-4">
              <div className="text-center space-y-2">
                <User className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-lg font-semibold">Acceso de Empleado</h3>
                <p className="text-sm text-muted-foreground">Ingresa con tus credenciales de empleado</p>
              </div>

              <form onSubmit={handleEmpleadoLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-usuario">Usuario</Label>
                  <Input
                    id="emp-usuario"
                    type="text"
                    placeholder="Nombre de usuario"
                    value={empleadoForm.usuario}
                    onChange={(e) => setEmpleadoForm({ ...empleadoForm, usuario: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="emp-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      value={empleadoForm.password}
                      onChange={(e) => setEmpleadoForm({ ...empleadoForm, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              {/* Credenciales de prueba para empleados */}
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium text-foreground mb-2">👥 Credenciales de prueba:</p>
                <div className="space-y-1 text-muted-foreground">
                  <p>
                    • <strong>empleado1</strong> / emp123
                  </p>
                  <p>
                    • <strong>empleado2</strong> / emp123
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Login de Propietario */}
            <TabsContent value="propietario" className="space-y-4">
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-lg font-semibold">Acceso de Propietario</h3>
                <p className="text-sm text-muted-foreground">Requiere llave maestra para acceso completo</p>
              </div>

              <form onSubmit={handlePropietarioLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prop-usuario">Usuario</Label>
                  <Input
                    id="prop-usuario"
                    type="text"
                    placeholder="Nombre de usuario"
                    value={propietarioForm.usuario}
                    onChange={(e) => setPropietarioForm({ ...propietarioForm, usuario: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prop-password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="prop-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      value={propietarioForm.password}
                      onChange={(e) => setPropietarioForm({ ...propietarioForm, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="llave-propietario" className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    Llave Maestra
                  </Label>
                  <div className="relative">
                    <Input
                      id="llave-propietario"
                      type={showMasterKey ? "text" : "password"}
                      placeholder="Llave maestra del propietario"
                      value={propietarioForm.llavePropietario}
                      onChange={(e) => setPropietarioForm({ ...propietarioForm, llavePropietario: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowMasterKey(!showMasterKey)}
                    >
                      {showMasterKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Acceso de Propietario"}
                </Button>
              </form>

              {/* Credenciales de prueba para propietario */}
              <div className="bg-primary/10 p-3 rounded-lg text-sm border border-primary/20">
                <p className="font-medium text-foreground mb-2">🔑 Credenciales de prueba:</p>
                <div className="space-y-1 text-muted-foreground">
                  <p>
                    • <strong>Usuario:</strong> propietario
                  </p>
                  <p>
                    • <strong>Contraseña:</strong> admin123
                  </p>
                  <p>
                    • <strong>Llave Maestra:</strong> AV2024MASTER
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-4 border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
