"use client"

import { useState } from "react"
import { mockAbsences } from "@/lib/data/mock-absences"
import { mockEmployees } from "@/lib/data/mock-employees"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/status-badge"
import { Plus, UserX, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import { toast } from "sonner"

export default function AusenciasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const pendingCount = mockAbsences.filter((a) => a.status === "pendiente").length
  const approvedCount = mockAbsences.filter((a) => a.status === "aprobada").length

  const availableReplacements = mockEmployees.filter(
    (e) => e.status === "activo" && !mockAbsences.some((a) => a.employeeId === e.id && a.status !== "rechazada")
  )

  function handleSave() {
    toast.success("Ausencia registrada correctamente (demo)")
    setDialogOpen(false)
  }

  function handleApprove(id: string) {
    toast.success("Ausencia aprobada (demo)")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ausencias y Reemplazos</h1>
          <p className="text-muted-foreground">Gestion de ausencias del personal y asignacion de reemplazos.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Ausencia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Ausencia</DialogTitle>
              <DialogDescription>Registra la ausencia de un empleado y asigna un reemplazo si es necesario.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Empleado</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                  <SelectContent>
                    {mockEmployees.filter((e) => e.status === "activo").map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tipo de Ausencia</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enfermedad">Enfermedad</SelectItem>
                    <SelectItem value="calamidad">Calamidad</SelectItem>
                    <SelectItem value="permiso">Permiso</SelectItem>
                    <SelectItem value="vacaciones">Vacaciones</SelectItem>
                    <SelectItem value="injustificada">Injustificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Fecha Inicio</Label>
                  <Input type="date" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Fecha Fin</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Motivo</Label>
                <Textarea placeholder="Describe el motivo de la ausencia..." rows={2} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Reemplazo Sugerido</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Seleccionar reemplazo (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {availableReplacements.slice(0, 8).map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Registrar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Aprobadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserX className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockAbsences.length}</p>
              <p className="text-xs text-muted-foreground">Total Registradas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registro de Ausencias</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="hidden md:table-cell">Motivo</TableHead>
                  <TableHead>Reemplazo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAbsences.map((absence) => (
                  <TableRow key={absence.id}>
                    <TableCell className="font-medium">{absence.employeeName}</TableCell>
                    <TableCell className="text-sm capitalize">{absence.type}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(absence.startDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      {" - "}
                      {new Date(absence.endDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:table-cell">
                      {absence.reason}
                    </TableCell>
                    <TableCell className="text-sm">
                      {absence.replacementName ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {absence.replacementName}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge status={absence.status} /></TableCell>
                    <TableCell>
                      {absence.status === "pendiente" && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(absence.id)}>
                          Aprobar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
