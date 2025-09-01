"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  nombre: string
  rol: "propietario" | "empleado"
  email?: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: { usuario: string; password: string; llavePropietario?: string }) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isPropietario: boolean
  isEmpleado: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 🔑 Llave maestra del propietario (en producción esto debería estar en variables de entorno)
const LLAVE_PROPIETARIO = "AV2024MASTER"

// 👥 Base de datos simulada de usuarios
const USUARIOS_DB = [
  {
    id: "1",
    usuario: "propietario",
    password: "admin123",
    nombre: "Administrador A&V",
    rol: "propietario" as const,
    email: "admin@accesoriosav.com",
  },
  {
    id: "2",
    usuario: "empleado1",
    password: "emp123",
    nombre: "María López",
    rol: "empleado" as const,
    email: "maria@accesoriosav.com",
  },
  {
    id: "3",
    usuario: "empleado2",
    password: "emp123",
    nombre: "Carlos Ruiz",
    rol: "empleado" as const,
    email: "carlos@accesoriosav.com",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("jewelry-auth-user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        localStorage.removeItem("jewelry-auth-user")
      }
    }
    setIsLoading(false)
  }, [])

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem("jewelry-auth-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("jewelry-auth-user")
    }
  }, [user])

  const login = async (credentials: {
    usuario: string
    password: string
    llavePropietario?: string
  }): Promise<boolean> => {
    const { usuario, password, llavePropietario } = credentials

    // Buscar usuario en la base de datos
    const foundUser = USUARIOS_DB.find((u) => u.usuario === usuario && u.password === password)

    if (!foundUser) {
      return false
    }

    // Si es propietario, verificar llave maestra
    if (foundUser.rol === "propietario") {
      if (!llavePropietario || llavePropietario !== LLAVE_PROPIETARIO) {
        return false
      }
    }

    // Login exitoso
    const userSession: User = {
      id: foundUser.id,
      nombre: foundUser.nombre,
      rol: foundUser.rol,
      email: foundUser.email,
    }

    setUser(userSession)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("jewelry-auth-user")
  }

  const isAuthenticated = !!user
  const isPropietario = user?.rol === "propietario"
  const isEmpleado = user?.rol === "empleado"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isPropietario,
        isEmpleado,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
