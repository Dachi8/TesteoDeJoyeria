"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePropietario?: boolean
}

export function ProtectedRoute({ children, requirePropietario = false }: ProtectedRouteProps) {
  const { isAuthenticated, isPropietario } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (requirePropietario && !isPropietario) {
      router.push("/")
      return
    }
  }, [isAuthenticated, isPropietario, requirePropietario, router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requirePropietario && !isPropietario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Acceso Denegado</h2>
          <p className="text-muted-foreground">Solo el propietario puede acceder a esta sección</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
