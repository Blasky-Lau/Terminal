import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  // Shift statuses
  borrador: "bg-muted text-muted-foreground",
  publicado: "bg-primary/10 text-primary",
  confirmado: "bg-emerald-50 text-emerald-700",
  rechazado: "bg-red-50 text-red-700",
  // Employee statuses
  activo: "bg-emerald-50 text-emerald-700",
  inactivo: "bg-muted text-muted-foreground",
  vacaciones: "bg-amber-50 text-amber-700",
  licencia: "bg-orange-50 text-orange-700",
  // Absence statuses
  pendiente: "bg-amber-50 text-amber-700",
  aprobada: "bg-emerald-50 text-emerald-700",
  // Generic
  online: "bg-emerald-50 text-emerald-700",
  offline: "bg-muted text-muted-foreground",
}

const statusLabels: Record<string, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  confirmado: "Confirmado",
  rechazado: "Rechazado",
  activo: "Activo",
  inactivo: "Inactivo",
  vacaciones: "Vacaciones",
  licencia: "Licencia",
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  online: "En linea",
  offline: "Desconectado",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {statusLabels[status] || status}
    </Badge>
  )
}
