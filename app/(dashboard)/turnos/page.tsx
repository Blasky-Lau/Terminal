"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Search, Plus } from "lucide-react"
import { toast } from "sonner"

type ShiftStatus = "borrador" | "publicado" | "confirmado" | "rechazado"

type ShiftRow = {
  id: string
  employeeId: string
  employeeName: string
  positionId: string
  positionName: string
  date: string
  timeSlotId: string
  startTime: string
  endTime: string
  status: ShiftStatus
  notes?: string
  createdBy: string
}

type EmployeeOption = { id: string; firstName: string; lastName: string; status: string }
type PositionOption = { id: string; name: string; isActive: boolean; timeSlots: { id: string; name: string; startTime: string; endTime: string }[] }

export default function TurnosPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [shifts, setShifts] = useState<ShiftRow[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [positions, setPositions] = useState<PositionOption[]>([])
  const [loading, setLoading] = useState(true)

  const [newEmployeeId, setNewEmployeeId] = useState("")
  const [newPositionId, setNewPositionId] = useState("")
  const [newTimeSlotId, setNewTimeSlotId] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newStatus, setNewStatus] = useState<ShiftStatus>("borrador")
  const [creating, setCreating] = useState(false)

  async function loadData() {
    try {
      const [shiftsRes, employeesRes, positionsRes] = await Promise.all([
        fetch("/api/shifts", { cache: "no-store" }),
        fetch("/api/employees", { cache: "no-store" }),
        fetch("/api/positions", { cache: "no-store" }),
      ])

      const shiftsData = shiftsRes.ok ? await shiftsRes.json() : []
      const employeesData = employeesRes.ok ? await employeesRes.json() : []
      const positionsData = positionsRes.ok ? await positionsRes.json() : []

      setShifts(
        (shiftsData || []).map((s: any) => ({
          id: s.id,
          employeeId: s.employeeId,
          employeeName: `${s.employee?.firstName || ""} ${s.employee?.lastName || ""}`.trim() || "Sin empleado",
          positionId: s.positionId,
          positionName: s.position?.name || "Sin puesto",
          date: new Date(s.date).toISOString().slice(0, 10),
          timeSlotId: s.timeSlotId,
          startTime: s.timeSlot?.startTime || "00:00",
          endTime: s.timeSlot?.endTime || "00:00",
          status: s.status,
          notes: s.notes || undefined,
          createdBy: s.createdBy,
        }))
      )
      setEmployees((employeesData || []).filter((e: any) => e.status === "activo"))
      setPositions((positionsData || []).filter((p: any) => p.isActive))
    } catch {
      toast.error("No se pudo cargar la información de turnos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedPosition = useMemo(
    () => positions.find((p) => p.id === newPositionId) || null,
    [positions, newPositionId]
  )

  const filtered = useMemo(() => {
    return shifts.filter((shift) => {
      const matchesSearch =
        search === "" ||
        shift.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        shift.positionName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "todos" || shift.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, shifts])

  async function handleCreateShift() {
    if (!newEmployeeId || !newPositionId || !newTimeSlotId || !newDate) {
      toast.error("Completa empleado, puesto, franja y fecha")
      return
    }

    try {
      setCreating(true)
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: newEmployeeId,
          positionId: newPositionId,
          timeSlotId: newTimeSlotId,
          date: newDate,
          status: newStatus,
          createdBy: "system",
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || "No se pudo crear el turno")
        return
      }

      toast.success("Turno creado correctamente")
      setNewEmployeeId("")
      setNewPositionId("")
      setNewTimeSlotId("")
      setNewDate("")
      setNewStatus("borrador")
      await loadData()
    } catch {
      toast.error("Error de red al crear turno")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Turnos</h1>
          <p className="text-muted-foreground">{shifts.length} turnos registrados.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="grid gap-3 md:grid-cols-6">
            <Select value={newEmployeeId} onValueChange={setNewEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newPositionId}
              onValueChange={(v) => {
                setNewPositionId(v)
                setNewTimeSlotId("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Puesto" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={newTimeSlotId} onValueChange={setNewTimeSlotId} disabled={!selectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Franja" />
              </SelectTrigger>
              <SelectContent>
                {(selectedPosition?.timeSlots || []).map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.name} ({slot.startTime} - {slot.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />

            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ShiftStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleCreateShift} disabled={creating}>
              <Plus className="mr-2 h-4 w-4" />
              {creating ? "Creando..." : "Nuevo Turno"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-4">
        {(["confirmado", "publicado", "borrador", "rechazado"] as const).map((status) => {
          const count = shifts.filter((s) => s.status === status).length
          return (
            <Card key={status} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setStatusFilter(status)}>
              <CardContent className="flex items-center justify-between p-4">
                <StatusBadge status={status} />
                <span className="text-2xl font-bold">{count}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado o puesto..."
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
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Cargando turnos...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No se encontraron turnos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.employeeName}</TableCell>
                      <TableCell className="text-sm">{shift.positionName}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{shift.startTime} - {shift.endTime}</TableCell>
                      <TableCell><StatusBadge status={shift.status} /></TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:table-cell">
                        {shift.notes || "-"}
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
