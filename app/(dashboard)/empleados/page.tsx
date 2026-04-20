"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { Search, Plus, Eye, Trash2 } from "lucide-react"

type Employee = {
  id: string
  terminalCode: string
  firstName: string
  lastName: string
  documentNumber: string
  area: string
  status: "activo" | "inactivo" | "vacaciones" | "licencia"
}

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [areaFilter, setAreaFilter] = useState("todas")

  async function loadEmployees() {
    try {
      const res = await fetch("/api/employees", { cache: "no-store" })
      const data = await res.json()
      if (res.ok) {
        setEmployees(data)
      } else {
        setEmployees([])
      }
    } catch {
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const areas = useMemo(() => {
    const areaSet = new Set(employees.map((e) => e.area))
    return Array.from(areaSet).sort()
  }, [employees])

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        search === "" ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.terminalCode.toLowerCase().includes(search.toLowerCase()) ||
        emp.documentNumber.includes(search)

      const matchesStatus = statusFilter === "todos" || emp.status === statusFilter
      const matchesArea = areaFilter === "todas" || emp.area === areaFilter

      return matchesSearch && matchesStatus && matchesArea
    })
  }, [employees, search, statusFilter, areaFilter])

  async function handleDeleteEmployee(id: string) {
    const ok = window.confirm("¿Seguro que deseas eliminar este empleado? Esta acción no se puede deshacer.")
    if (!ok) return

    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || "No se pudo eliminar el empleado")
        return
      }

      toast.success("Empleado eliminado correctamente")
      await loadEmployees()
    } catch {
      toast.error("Error de red al eliminar empleado")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Empleados</h1>
          <p className="text-muted-foreground">
            Gestion del personal del terminal. {employees.length} empleados registrados.
          </p>
        </div>
        <Button asChild>
          <Link href="/empleados/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, codigo o documento..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="vacaciones">Vacaciones</SelectItem>
                <SelectItem value="licencia">Licencia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Documento</TableHead>
                  <TableHead className="hidden lg:table-cell">Area</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[120px]">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Cargando empleados...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No se encontraron empleados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-mono text-xs">{emp.terminalCode}</TableCell>
                      <TableCell className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {emp.documentNumber}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {emp.area}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={emp.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/empleados/${emp.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalle</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar empleado</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
