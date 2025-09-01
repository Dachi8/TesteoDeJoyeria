"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Si no está autenticado y no está en la página de login, no mostrar el sidebar
  if (!isAuthenticated && pathname !== "/login") {
    return <>{children}</>
  }

  // Si está en la página de login, no mostrar el sidebar
  if (pathname === "/login") {
    return <>{children}</>
  }

  // Si está autenticado, mostrar con sidebar
  return <>{children}</>
}
