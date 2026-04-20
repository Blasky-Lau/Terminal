"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { History, Search, Filter } from "lucide-react"
import { mockHistory } from "@/lib/data/mock-history"

const actionLabels: Record<string, string> = {
  crear: "Creado",
  actualizar: "Actualizado",
  eliminar: "Eliminado",
  publicar: "Publicado",
}

const actionColors: Record<string, string> = {
  crear: "bg-emerald-100 text-emerald-700",
  actualizar: "bg-sky-100 text-sky-700",
  eliminar: "bg-red-100 text-red-700",
  publicar: "bg-amber-100 text-amber-700",
}

const entityLabels: Record<string, string> = {
  empleado: "Empleado",
  turno: "Turno",
  horario: "Horario",
  puesto: "Puesto",
  ausencia: "Ausencia",
  configuracion: "Configuracion",
}

export default function HistorialPage() {
  const [search, setSearch] = useState("")
  const [entityFilter, setEntityFilter] = useState("todas")

  const filtered = mockHistory.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      entry.userName.toLowerCase().includes(search.toLowerCase())
    const matchesEntity = entityFilter === "todas" || entry.entityType === entityFilter
    return matchesSearch && matchesEntity
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Historial de Cambios</h1>
        <p className="text-sm text-muted-foreground">Registro de todas las acciones realizadas en el sistema</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar en historial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las entidades</SelectItem>
            <SelectItem value="empleado">Empleados</SelectItem>
            <SelectItem value="turno">Turnos</SelectItem>
            <SelectItem value="horario">Horarios</SelectItem>
            <SelectItem value="puesto">Puestos</SelectItem>
            <SelectItem value="ausencia">Ausencias</SelectItem>
            <SelectItem value="configuracion">Configuracion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            Actividad Reciente ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No se encontraron registros</p>
          ) : (
            <div className="flex flex-col gap-0">
              {filtered.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    idx < filtered.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className={actionColors[entry.action]}>
                        {actionLabels[entry.action]}
                      </Badge>
                      <Badge variant="outline">{entityLabels[entry.entityType]}</Badge>
                    </div>
                    <p className="text-sm text-foreground">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Por {entry.userName}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
