"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

const routeNames = {
  "/": "Dashboard",
  "/catalogo": "Catálogo",
  "/productos": "Productos",
  "/ventas": "Ventas",
  "/reconversor": "Reconversor",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
}

export function MobileHeader() {
  const pathname = usePathname()
  const currentPage = routeNames[pathname] || "Página"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo-av.jpg"
                  alt="ACCESORIOS A&V Logo"
                  width={20}
                  height={20}
                  className="object-cover rounded"
                />
                <span>ACCESORIOS A&V</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
