"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { getWeekDates } from "@/lib/data/mock-shifts"
import { mockEmployees } from "@/lib/data/mock-employees"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CalendarDays, Wand2, Send, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Shift, Position } from "@/lib/types"

const DAY_NAMES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

const STATUS_COLORS: Record<string, string> = {
  confirmado: "bg-emerald-100 border-emerald-300 text-emerald-800",
  publicado: "bg-sky-100 border-sky-300 text-sky-800",
  borrador: "bg-muted border-border text-muted-foreground",
  rechazado: "bg-red-100 border-red-300 text-red-800",
}

export default function HorariosPage() {
  const [scheduleStatus, setScheduleStatus] = useState<"borrador" | "publicado">("publicado")
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedPositionId, setSelectedPositionId] = useState<string>("")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("")
  const weekDates = useMemo(() => getWeekDates(), [])

  const mapShift = useCallback(
    (s: any): Shift => ({
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
      createdAt: s.createdAt,
    }),
    []
  )

  const loadData = useCallback(async () => {
    try {
      const [positionsRes, shiftsRes] = await Promise.all([fetch("/api/positions"), fetch("/api/shifts")])

      if (positionsRes.ok) {
        const posData = await positionsRes.json()
        setPositions((posData || []).filter((p: Position) => p.isActive))
      }

      if (shiftsRes.ok) {
        const shiftData = await shiftsRes.json()
        setShifts((shiftData || []).map(mapShift))
      }
    } catch {
      toast.error("No se pudieron cargar puestos y turnos")
    }
  }, [mapShift])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Build grid data: position x day -> shifts
  const gridData = useMemo(() => {
    const map: Record<string, Record<string, Shift[]>> = {}
    for (const pos of positions) {
      map[pos.id] = {}
      for (const date of weekDates) {
        map[pos.id][date] = shifts.filter((s) => s.positionId === pos.id && s.date === date)
      }
    }
    return map
  }, [positions, weekDates, shifts])

  async function handleGenerate() {
    try {
      const res = await fetch("/api/shifts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "borrador" }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || "No se pudo generar el horario")
        return
      }

      setScheduleStatus("borrador")
      const generated = Number(data?.generated ?? 0)
      const deletedPrevious = Number(data?.deletedPrevious ?? 0)

      if (deletedPrevious > 0) {
        toast.success(`Horario regenerado según turnos definidos. Reemplazados ${deletedPrevious} y creados ${generated}.`)
      } else {
        toast.success(`Horario generado según turnos definidos. Creados ${generated}.`)
      }

      await loadData()
    } catch {
      toast.error("Error generando horario")
    }
  }

  function handlePublish() {
    setScheduleStatus("publicado")
    toast.success("Horario publicado. Los empleados recibiran notificacion.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Horarios Semanales</h1>
          <p className="text-muted-foreground">
            Semana del {new Date(weekDates[0]).toLocaleDateString("es-CO", { day: "numeric", month: "long" })} al{" "}
            {new Date(weekDates[6]).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generar Automatico
          </Button>
          {scheduleStatus === "borrador" && (
            <Button onClick={handlePublish}>
              <Send className="mr-2 h-4 w-4" />
              Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" disabled>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Semana anterior
        </Button>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Semana Actual</span>
          <StatusBadge status={scheduleStatus} />
        </div>
        <Button variant="ghost" size="sm" disabled>
          Semana siguiente
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="overflow-auto p-0">
          <div className="min-w-[900px]">
            {/* Header row with days */}
            <div className="grid grid-cols-[180px_repeat(7,1fr)] border-b bg-muted/50">
              <div className="flex items-center p-3 text-sm font-medium text-muted-foreground">
                Puesto / Dia
              </div>
              {weekDates.map((date, i) => (
                <div key={date} className="flex flex-col items-center border-l p-2 text-center">
                  <span className="text-xs font-medium text-muted-foreground">{DAY_NAMES[i]}</span>
                  <span className="text-sm font-semibold">
                    {new Date(date).getDate()}
                  </span>
                </div>
              ))}
            </div>

            {/* Position rows */}
            {positions.map((position) => (
              <div key={position.id} className="grid grid-cols-[180px_repeat(7,1fr)] border-b last:border-b-0">
                <div className="flex flex-col justify-center border-r bg-muted/30 p-3">
                  <span className="text-sm font-medium text-foreground">{position.name}</span>
                  <span className="text-xs text-muted-foreground">{position.area}</span>
                </div>
                {weekDates.map((date) => {
                  const shifts = gridData[position.id]?.[date] || []
                  return (
                    <div
                      key={date}
                      className="flex min-h-[72px] flex-col gap-1 border-l p-1.5"
                    >
                      {shifts.map((shift) => (
                        <button
                          key={shift.id}
                          onClick={() => setSelectedShift(shift)}
                          className={`rounded-md border px-2 py-1 text-left text-xs transition-colors hover:opacity-80 ${STATUS_COLORS[shift.status]}`}
                        >
                          <p className="font-medium truncate">{shift.employeeName}</p>
                          <p className="opacity-70">{shift.startTime}-{shift.endTime}</p>
                        </button>
                      ))}
                      {shifts.length === 0 && (
                        <button
                          onClick={() => {
                            setSelectedDate(date)
                            setSelectedPositionId(position.id)
                            setSelectedEmployeeId("")
                            setSelectedTimeSlotId("")
                            setAddDialogOpen(true)
                          }}
                          className="flex h-full min-h-[48px] items-center justify-center rounded-md border border-dashed text-muted-foreground/40 transition-colors hover:border-primary/30 hover:text-primary/60"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(STATUS_COLORS).map(([status, className]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`h-3 w-6 rounded border ${className}`} />
            <span className="text-xs capitalize text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>

      {/* Shift detail dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Turno</DialogTitle>
            <DialogDescription>
              {selectedShift && `${selectedShift.positionName} - ${new Date(selectedShift.date).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}`}
            </DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="flex flex-col gap-4">
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Empleado</dt>
                  <dd className="font-medium">{selectedShift.employeeName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Horario</dt>
                  <dd className="font-medium">{selectedShift.startTime} - {selectedShift.endTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd><StatusBadge status={selectedShift.status} /></dd>
                </div>
                {selectedShift.notes && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Notas</dt>
                    <dd className="rounded-md bg-muted p-2 text-sm">{selectedShift.notes}</dd>
                  </div>
                )}
              </dl>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedShift(null)}>Cerrar</Button>
                <Button
                  onClick={async () => {
                    if (!selectedShift) return
                    try {
                      const nextStatus =
                        selectedShift.status === "borrador" ? "publicado" : "borrador"
                      const res = await fetch(`/api/shifts/${selectedShift.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: nextStatus }),
                      })
                      const data = await res.json()
                      if (!res.ok) {
                        toast.error(data?.error || "No se pudo actualizar el turno")
                        return
                      }
                      toast.success("Turno actualizado correctamente")
                      setSelectedShift(null)
                      await loadData()
                    } catch {
                      toast.error("Error actualizando turno")
                    }
                  }}
                >
                  Editar Turno
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add shift dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Turno</DialogTitle>
            <DialogDescription>Selecciona un empleado para este turno.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Empleado</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                <SelectContent>
                  {mockEmployees.filter((e) => e.status === "activo").map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Franja Horaria</Label>
              <Select value={selectedTimeSlotId} onValueChange={setSelectedTimeSlotId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar franja" /></SelectTrigger>
                <SelectContent>
                  {(positions.find((p) => p.id === selectedPositionId)?.timeSlots || []).map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.name} ({slot.startTime} - {slot.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
              <Button
                onClick={async () => {
                  try {
                    if (!selectedDate || !selectedPositionId || !selectedEmployeeId || !selectedTimeSlotId) {
                      toast.error("Debes completar empleado y franja horaria")
                      return
                    }

                    const res = await fetch("/api/shifts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        employeeId: selectedEmployeeId,
                        positionId: selectedPositionId,
                        timeSlotId: selectedTimeSlotId,
                        date: selectedDate,
                        status: "borrador",
                        createdBy: "system",
                      }),
                    })

                    const data = await res.json()
                    if (!res.ok) {
                      toast.error(data?.error || "No se pudo asignar el turno")
                      return
                    }

                    toast.success("Turno asignado correctamente")
                    setAddDialogOpen(false)
                    setSelectedEmployeeId("")
                    setSelectedTimeSlotId("")
                    await loadData()
                  } catch {
                    toast.error("Error asignando turno")
                  }
                }}
              >
                Asignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
