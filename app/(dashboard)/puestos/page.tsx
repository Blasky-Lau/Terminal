"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Users, Clock, Plus, ShieldAlert, BadgeCheck } from "lucide-react"
import { toast } from "sonner"

type PositionCoverageMode = "single_required" | "both_required" | "one_required"

type ApiPosition = {
  id: string
  name: string
  area: string
  description?: string | null
  requiredStaff: number
  isMandatory: boolean
  isPriority: boolean
  priorityStaffCount?: number | null
  dualCoverageMode: PositionCoverageMode
  isActive: boolean
  timeSlots: { id: string; name: string; startTime: string; endTime: string }[]
  shifts?: { id: string; employeeId: string }[]
}

export default function PuestosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [positions, setPositions] = useState<ApiPosition[]>([])
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    description: "",
    requiredStaff: 1,
    isMandatory: false,
    isPriority: false,
    priorityStaffCount: 1,
    dualCoverageMode: "both_required" as PositionCoverageMode,
    slotName: "Manana",
    slotStart: "05:00",
    slotEnd: "13:00",
  })

  async function loadPositions() {
    try {
      setLoading(true)
      const res = await fetch("/api/positions")
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudieron cargar los puestos")
        return
      }
      setPositions(data as ApiPosition[])
    } catch {
      toast.error("Error de red cargando puestos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPositions()
  }, [])

  function getEmployeeCount(position: ApiPosition) {
    return new Set((position.shifts ?? []).map((s) => s.employeeId)).size
  }

  async function handleSave() {
    if (!formData.name || !formData.area) {
      toast.error("Nombre y área son obligatorios")
      return
    }

    if (formData.isPriority && Number(formData.priorityStaffCount) < 1) {
      toast.error("Si el puesto es prioridad, indica al menos 1 persona prioritaria")
      return
    }

    if (Number(formData.priorityStaffCount) > Number(formData.requiredStaff)) {
      toast.error("La cantidad prioritaria no puede superar el personal requerido")
      return
    }

    if (Number(formData.requiredStaff) !== 2 && formData.dualCoverageMode !== "both_required") {
      toast.error("La cobertura dual solo aplica para puestos con 2 personas")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          area: formData.area,
          description: formData.description,
          requiredStaff: Number(formData.requiredStaff),
          isMandatory: formData.isMandatory,
          isPriority: formData.isPriority,
          priorityStaffCount: formData.isPriority ? Number(formData.priorityStaffCount) : null,
          dualCoverageMode: Number(formData.requiredStaff) === 2 ? formData.dualCoverageMode : "single_required",
          timeSlots: [
            {
              name: formData.slotName,
              startTime: formData.slotStart,
              endTime: formData.slotEnd,
            },
          ],
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo crear el puesto")
        return
      }

      toast.success("Puesto creado correctamente")
      setDialogOpen(false)
      setFormData({
        name: "",
        area: "",
        description: "",
        requiredStaff: 1,
        isMandatory: false,
        isPriority: false,
        priorityStaffCount: 1,
        dualCoverageMode: "both_required",
        slotName: "Manana",
        slotStart: "05:00",
        slotEnd: "13:00",
      })
      await loadPositions()
    } catch {
      toast.error("Error de red al crear puesto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Puestos Operativos</h1>
          <p className="text-muted-foreground">Gestion de los puestos de trabajo del terminal. {positions.length} puestos configurados.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Puesto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Puesto Operativo</DialogTitle>
              <DialogDescription>Agrega un nuevo puesto de trabajo al sistema.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Nombre del Puesto</Label>
                <Input placeholder="Ej: Operador de Taquilla" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Area</Label>
                <Input placeholder="Ej: Taquillas" value={formData.area} onChange={(e) => setFormData((p) => ({ ...p, area: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Descripcion</Label>
                <Textarea placeholder="Descripcion de funciones y responsabilidades..." rows={3} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Personal Requerido</Label>
                  <Input type="number" value={formData.requiredStaff} min={1} onChange={(e) => setFormData((p) => ({ ...p, requiredStaff: Number(e.target.value) }))} />
                </div>

                <div className="flex items-end gap-2">
                  <input
                    id="isMandatory"
                    type="checkbox"
                    checked={formData.isMandatory}
                    onChange={(e) => setFormData((p) => ({ ...p, isMandatory: e.target.checked }))}
                  />
                  <Label htmlFor="isMandatory">Puesto obligatorio</Label>
                </div>

                <div className="flex items-end gap-2">
                  <input
                    id="isPriority"
                    type="checkbox"
                    checked={formData.isPriority}
                    onChange={(e) => setFormData((p) => ({ ...p, isPriority: e.target.checked }))}
                  />
                  <Label htmlFor="isPriority">Puesto prioritario</Label>
                </div>

                {formData.isPriority && (
                  <div className="flex flex-col gap-2">
                    <Label>Personas prioritarias</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.priorityStaffCount}
                      onChange={(e) => setFormData((p) => ({ ...p, priorityStaffCount: Number(e.target.value) }))}
                    />
                  </div>
                )}

                {Number(formData.requiredStaff) === 2 && (
                  <div className="flex flex-col gap-2">
                    <Label>Cobertura de 2 personas</Label>
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={formData.dualCoverageMode}
                      onChange={(e) => setFormData((p) => ({ ...p, dualCoverageMode: e.target.value as PositionCoverageMode }))}
                    >
                      <option value="both_required">Ambos obligatorios</option>
                      <option value="one_required">Solo uno obligatorio</option>
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label>Nombre franja</Label>
                  <Input value={formData.slotName} onChange={(e) => setFormData((p) => ({ ...p, slotName: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Hora inicio</Label>
                  <Input type="time" value={formData.slotStart} onChange={(e) => setFormData((p) => ({ ...p, slotStart: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Hora fin</Label>
                  <Input type="time" value={formData.slotEnd} onChange={(e) => setFormData((p) => ({ ...p, slotEnd: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Cargando puestos...</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {positions.map((position) => {
            const activeCount = getEmployeeCount(position)
            const isCovered = activeCount >= position.requiredStaff
            return (
              <Card key={position.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{position.name}</CardTitle>
                        <CardDescription className="text-xs">{position.area}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{position.description || "Sin descripción."}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1">
                      {position.isMandatory && (
                        <Badge variant="destructive" className="text-xs">
                          <ShieldAlert className="mr-1 h-3 w-3" />
                          Obligatorio
                        </Badge>
                      )}
                      {position.isPriority && (
                        <Badge variant="default" className="text-xs">
                          <BadgeCheck className="mr-1 h-3 w-3" />
                          Prioridad {position.priorityStaffCount ? `(${position.priorityStaffCount})` : ""}
                        </Badge>
                      )}
                      {position.requiredStaff === 2 && (
                        <Badge variant="outline" className="text-xs">
                          {position.dualCoverageMode === "both_required" ? "2 obligatorios" : "1 obligatorio + 1 apoyo"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>Personal</span>
                      </div>
                      <Badge variant={isCovered ? "default" : "destructive"} className="text-xs">
                        {activeCount} / {position.requiredStaff}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{position.timeSlots.length} franjas horarias</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {position.timeSlots.map((slot) => (
                        <Badge key={slot.id} variant="outline" className="text-xs font-normal">
                          {slot.name}: {slot.startTime}-{slot.endTime}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
