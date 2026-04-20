"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockShifts } from "@/lib/data/mock-shifts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, AlertTriangle, Clock, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"
import type { Shift } from "@/lib/types"

function EmployeeConfirmations() {
  const myShifts = mockShifts.filter((s) => s.employeeId === "emp-001")
  const pending = myShifts.filter((s) => s.status === "publicado")
  const confirmed = myShifts.filter((s) => s.status === "confirmado")
  const rejected = myShifts.filter((s) => s.status === "rechazado")
  const [rejectDialog, setRejectDialog] = useState<Shift | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  function handleConfirm(shiftId: string) {
    toast.success("Turno confirmado correctamente")
  }

  function handleReject() {
    toast.success("Turno rechazado. Se notifico al supervisor.")
    setRejectDialog(null)
    setRejectReason("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Confirmaciones</h1>
        <p className="text-muted-foreground">Revisa y confirma tus turnos asignados para esta semana.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pending.length}</p>
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
              <p className="text-2xl font-bold">{confirmed.length}</p>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejected.length}</p>
              <p className="text-xs text-muted-foreground">Rechazados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending shifts */}
      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Turnos Pendientes de Confirmacion</CardTitle>
            <CardDescription>Confirma o rechaza los turnos asignados.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pending.map((shift) => (
              <div key={shift.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{shift.positionName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setRejectDialog(shift)}>
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Rechazar
                  </Button>
                  <Button size="sm" onClick={() => handleConfirm(shift.id)}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Confirmar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos Mis Turnos</CardTitle>
          <CardDescription>Vista completa de la semana.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {myShifts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No tienes turnos asignados esta semana.</p>
          ) : (
            myShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{shift.positionName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" })} - {shift.startTime} a {shift.endTime}
                  </span>
                </div>
                <StatusBadge status={shift.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Turno</DialogTitle>
            <DialogDescription>
              Indica el motivo por el cual no puedes tomar este turno.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {rejectDialog && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">{rejectDialog.positionName}</p>
                <p className="text-muted-foreground">
                  {new Date(rejectDialog.date).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })} - {rejectDialog.startTime} a {rejectDialog.endTime}
                </p>
              </div>
            )}
            <Textarea
              placeholder="Motivo del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleReject}>Rechazar Turno</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SupervisorConfirmations() {
  const allShifts = mockShifts
  const confirmed = allShifts.filter((s) => s.status === "confirmado")
  const pending = allShifts.filter((s) => s.status === "publicado")
  const rejected = allShifts.filter((s) => s.status === "rechazado")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Confirmaciones</h1>
        <p className="text-muted-foreground">Estado de confirmacion de turnos de todos los empleados.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pend. Confirmacion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{confirmed.length}</p>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejected.length}</p>
              <p className="text-xs text-muted-foreground">Rechazados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {rejected.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-4 w-4 text-red-500" />
              Turnos Rechazados
            </CardTitle>
            <CardDescription>Estos turnos necesitan reasignacion.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {rejected.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{shift.employeeName}</span>
                  <span className="text-xs text-muted-foreground">
                    {shift.positionName} - {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })} {shift.startTime}-{shift.endTime}
                  </span>
                  {shift.notes && <span className="text-xs text-red-600">Motivo: {shift.notes}</span>}
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info("Reasignar turno (demo)")}>
                  Reasignar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pendientes de Confirmacion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {pending.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Todos los turnos han sido respondidos.</p>
          ) : (
            pending.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{shift.employeeName}</span>
                  <span className="text-xs text-muted-foreground">
                    {shift.positionName} - {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })} {shift.startTime}-{shift.endTime}
                  </span>
                </div>
                <StatusBadge status="publicado" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmacionesPage() {
  const { user } = useAuth()
  if (!user) return null
  if (user.role === "empleado") return <EmployeeConfirmations />
  return <SupervisorConfirmations />
}
