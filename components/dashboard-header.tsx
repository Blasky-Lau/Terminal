"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NotificationPopover } from "@/components/notification-popover"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/empleados": "Empleados",
  "/empleados/nuevo": "Nuevo Empleado",
  "/puestos": "Puestos Operativos",
  "/horarios": "Horarios",
  "/turnos": "Turnos",
  "/confirmaciones": "Confirmaciones",
  "/ausencias": "Ausencias",
  "/chat": "Chat",
  "/reportes": "Reportes",
  "/historial": "Historial",
  "/configuracion": "Configuracion",
}

export function DashboardHeader() {
  const pathname = usePathname()

  const currentTitle = pageTitles[pathname] || "Detalle"
  const isSubPage = pathname.split("/").filter(Boolean).length > 1 && !pageTitles[pathname]
  const parentPath = "/" + pathname.split("/").filter(Boolean)[0]
  const parentTitle = pageTitles[parentPath] || ""

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {isSubPage ? (
            <>
              <BreadcrumbItem>
                <a href={parentPath} className="text-muted-foreground hover:text-foreground">{parentTitle}</a>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <NotificationPopover />
    </header>
  )
}
