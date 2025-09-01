"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Tipos de datos
interface Product {
  id: number
  nombre: string
  categoria: string
  precio: number
  costo: number
  stock: number
  descripcion: string
  proveedor: string
  fechaIngreso: string
  imagen?: string
}

interface Sale {
  id: number
  fecha: string
  cliente: string
  vendedor: string
  productos: {
    nombre: string
    cantidad: number
    precio: number
    costo: number
  }[]
  total: number
  ganancia: number
  metodoPago: string
}

// 💰 Nuevo tipo para retiros/gastos
interface Withdrawal {
  id: number
  fecha: string
  cantidad: number
  concepto: string
  tipo: "gasto" | "retiro"
}

interface AppContextType {
  productos: Product[]
  ventas: Sale[]
  retiros: Withdrawal[] // 💰 Nuevo estado para retiros
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  deleteProduct: (id: number) => void
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: number, sale: Partial<Sale>) => void
  deleteSale: (id: number) => void
  addWithdrawal: (withdrawal: Omit<Withdrawal, "id">) => void // 💰 Nueva función
  deleteWithdrawal: (id: number) => void // 💰 Nueva función
  getTotalDineroDisponible: () => number // 💰 Nueva función
  getStats: () => {
    totalVentas: number
    totalGanancias: number
    totalProductos: number
    ventasHoy: number
    ventasEsteMes: number
    gananciasEsteMes: number
    totalRetiros: number // 💰 Nuevo campo
    dineroDisponible: number // 💰 Nuevo campo
  }
  getSalesData: () => any[]
  getCategoryData: () => any[]
  getRecentSales: () => Sale[]
  getLowStockItems: () => Product[]
  getVendedoresStats: () => any[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Sistema limpio - sin productos de ejemplo
const initialProducts: Product[] = []

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [productos, setProductos] = useState<Product[]>(initialProducts)
  const [ventas, setVentas] = useState<Sale[]>([])
  const [retiros, setRetiros] = useState<Withdrawal[]>([]) // 💰 Nuevo estado

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedProducts = localStorage.getItem("jewelry-products")
    const savedSales = localStorage.getItem("jewelry-sales")
    const savedWithdrawals = localStorage.getItem("jewelry-withdrawals") // 💰 Cargar retiros

    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts)
        setProductos(parsedProducts)
      } catch (error) {
        console.error("Error loading products from localStorage:", error)
        setProductos([])
      }
    }

    if (savedSales) {
      try {
        const parsedSales = JSON.parse(savedSales)
        setVentas(parsedSales)
      } catch (error) {
        console.error("Error loading sales from localStorage:", error)
        setVentas([])
      }
    }

    // 💰 Cargar retiros
    if (savedWithdrawals) {
      try {
        const parsedWithdrawals = JSON.parse(savedWithdrawals)
        setRetiros(parsedWithdrawals)
      } catch (error) {
        console.error("Error loading withdrawals from localStorage:", error)
        setRetiros([])
      }
    }
  }, [])

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem("jewelry-products", JSON.stringify(productos))
  }, [productos])

  useEffect(() => {
    localStorage.setItem("jewelry-sales", JSON.stringify(ventas))
  }, [ventas])

  // 💰 Guardar retiros en localStorage
  useEffect(() => {
    localStorage.setItem("jewelry-withdrawals", JSON.stringify(retiros))
  }, [retiros])

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1,
    }
    setProductos([...productos, newProduct])
  }

  const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
    setProductos(productos.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)))
  }

  const deleteProduct = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id))
  }

  const addSale = (sale: Omit<Sale, "id">) => {
    const newSale = {
      ...sale,
      id: ventas.length > 0 ? Math.max(...ventas.map((s) => s.id)) + 1 : 1,
    }

    // Actualizar stock de productos vendidos
    const updatedProducts = [...productos]
    sale.productos.forEach((saleProduct) => {
      const productIndex = updatedProducts.findIndex((p) => p.nombre === saleProduct.nombre)
      if (productIndex !== -1) {
        updatedProducts[productIndex].stock -= saleProduct.cantidad
      }
    })

    setProductos(updatedProducts)
    setVentas([...ventas, newSale])
  }

  const updateSale = (id: number, updatedSale: Partial<Sale>) => {
    const originalSale = ventas.find((s) => s.id === id)
    if (!originalSale) return

    // Restaurar stock de la venta original
    const updatedProducts = [...productos]
    originalSale.productos.forEach((saleProduct) => {
      const productIndex = updatedProducts.findIndex((p) => p.nombre === saleProduct.nombre)
      if (productIndex !== -1) {
        updatedProducts[productIndex].stock += saleProduct.cantidad
      }
    })

    // Aplicar nuevo stock si hay productos en la venta actualizada
    if (updatedSale.productos) {
      updatedSale.productos.forEach((saleProduct) => {
        const productIndex = updatedProducts.findIndex((p) => p.nombre === saleProduct.nombre)
        if (productIndex !== -1) {
          updatedProducts[productIndex].stock -= saleProduct.cantidad
        }
      })
    }

    setProductos(updatedProducts)
    setVentas(ventas.map((s) => (s.id === id ? { ...s, ...updatedSale } : s)))
  }

  const deleteSale = (id: number) => {
    const saleToDelete = ventas.find((s) => s.id === id)
    if (!saleToDelete) return

    // Restaurar stock de los productos vendidos
    const updatedProducts = [...productos]
    saleToDelete.productos.forEach((saleProduct) => {
      const productIndex = updatedProducts.findIndex((p) => p.nombre === saleProduct.nombre)
      if (productIndex !== -1) {
        updatedProducts[productIndex].stock += saleProduct.cantidad
      }
    })

    setProductos(updatedProducts)
    setVentas(ventas.filter((s) => s.id !== id))
  }

  // 💰 Nueva función para agregar retiros/gastos
  const addWithdrawal = (withdrawal: Omit<Withdrawal, "id">) => {
    const newWithdrawal = {
      ...withdrawal,
      id: retiros.length > 0 ? Math.max(...retiros.map((r) => r.id)) + 1 : 1,
    }
    setRetiros([...retiros, newWithdrawal])
  }

  // 💰 Nueva función para eliminar retiros
  const deleteWithdrawal = (id: number) => {
    setRetiros(retiros.filter((r) => r.id !== id))
  }

  // 💰 Nueva función para calcular dinero disponible
  const getTotalDineroDisponible = () => {
    const totalVentas = ventas.reduce((sum, sale) => sum + sale.total, 0)
    const totalRetiros = retiros.reduce((sum, retiro) => sum + retiro.cantidad, 0)
    return totalVentas - totalRetiros
  }

  const getStats = () => {
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const totalVentas = ventas.reduce((sum, sale) => sum + sale.total, 0)
    const totalGanancias = ventas.reduce((sum, sale) => sum + sale.ganancia, 0)
    const totalProductos = productos.length
    const totalRetiros = retiros.reduce((sum, retiro) => sum + retiro.cantidad, 0) // 💰 Total retiros
    const dineroDisponible = totalVentas - totalRetiros // 💰 Dinero disponible

    const ventasHoy = ventas.filter((sale) => sale.fecha === today).length

    const ventasEsteMes = ventas
      .filter((sale) => {
        const saleDate = new Date(sale.fecha)
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
      })
      .reduce((sum, sale) => sum + sale.total, 0)

    const gananciasEsteMes = ventas
      .filter((sale) => {
        const saleDate = new Date(sale.fecha)
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
      })
      .reduce((sum, sale) => sum + sale.ganancia, 0)

    return {
      totalVentas,
      totalGanancias,
      totalProductos,
      ventasHoy,
      ventasEsteMes,
      gananciasEsteMes,
      totalRetiros, // 💰 Nuevo campo
      dineroDisponible, // 💰 Nuevo campo
    }
  }

  const getSalesData = () => {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const currentYear = new Date().getFullYear()

    return monthNames.map((month, index) => {
      const monthSales = ventas.filter((sale) => {
        const saleDate = new Date(sale.fecha)
        return saleDate.getMonth() === index && saleDate.getFullYear() === currentYear
      })

      const ventas_mes = monthSales.reduce((sum, sale) => sum + sale.total, 0)
      const ganancias_mes = monthSales.reduce((sum, sale) => sum + sale.ganancia, 0)

      return {
        month,
        ventas: ventas_mes,
        ganancias: ganancias_mes,
      }
    })
  }

  const getCategoryData = () => {
    if (productos.length === 0) {
      return []
    }

    // Obtener categorías únicas de los productos reales
    const uniqueCategories = [...new Set(productos.map((p) => p.categoria))]
    const colors = ["hsl(var(--primary))", "hsl(var(--foreground))", "#B8860B", "#FFD700", "#FFA500", "#DAA520"]

    const totalProducts = productos.length

    return uniqueCategories
      .map((category, index) => {
        const categoryProducts = productos.filter((p) => p.categoria === category)
        const percentage = Math.round((categoryProducts.length / totalProducts) * 100)

        return {
          name: category,
          value: percentage,
          color: colors[index % colors.length],
        }
      })
      .filter((item) => item.value > 0)
  }

  const getRecentSales = () => {
    return ventas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5)
  }

  const getLowStockItems = () => {
    return productos.filter((product) => product.stock <= 5)
  }

  const getVendedoresStats = () => {
    if (ventas.length === 0) return []

    const vendedoresMap = new Map()

    ventas.forEach((sale) => {
      const vendedor = sale.vendedor || "Sin asignar"
      if (!vendedoresMap.has(vendedor)) {
        vendedoresMap.set(vendedor, {
          nombre: vendedor,
          totalVentas: 0,
          totalGanancias: 0,
          numeroVentas: 0,
        })
      }

      const stats = vendedoresMap.get(vendedor)
      stats.totalVentas += sale.total
      stats.totalGanancias += sale.ganancia
      stats.numeroVentas += 1
    })

    return Array.from(vendedoresMap.values()).sort((a, b) => b.totalVentas - a.totalVentas)
  }

  return (
    <AppContext.Provider
      value={{
        productos,
        ventas,
        retiros, // 💰 Nuevo estado
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        updateSale,
        deleteSale,
        addWithdrawal, // 💰 Nueva función
        deleteWithdrawal, // 💰 Nueva función
        getTotalDineroDisponible, // 💰 Nueva función
        getStats,
        getSalesData,
        getCategoryData,
        getRecentSales,
        getLowStockItems,
        getVendedoresStats,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
