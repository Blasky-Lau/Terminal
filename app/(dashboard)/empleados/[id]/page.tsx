"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/status-badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Clock } from "lucide-react"
import { toast } from "sonner"
import type { ShiftStatus } from "@/lib/types"

type EmployeeDetail = {
  id: string
  terminalCode: string
  firstName: string
  lastName: string
  documentType: "CC" | "CE" | "TI"
  documentNumber: string
  email: string
  phone?: string | null
  area: string
  status: "activo" | "inactivo" | "vacaciones" | "licencia"
  hireDate: string
  contractType: "fijo" | "indefinido" | "prestacion"
  weeklyHours: number
}

type EmployeeShift = {
  id: string
  date: string
  status: ShiftStatus
  positionName: string
  startTime: string
  endTime: string
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [employeeShifts, setEmployeeShifts] = useState<EmployeeShift[]>([])
  const [formData, setFormData] = useState<{
    firstName: string
    lastName: string
    documentType: "CC" | "CE" | "TI"
    documentNumber: string
    email: string
    phone: string
    area: string
    contractType: "fijo" | "indefinido" | "prestacion"
    weeklyHours: number
  }>({
    firstName: "",
    lastName: "",
    documentType: "CC",
    documentNumber: "",
    email: "",
    phone: "",
    area: "",
    contractType: "indefinido",
    weeklyHours: 48,
  })

  useEffect(() => {
    async function loadEmployee() {
      try {
        const res = await fetch(`/api/employees/${id}`, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true)
          } else {
            toast.error(data?.error || "No se pudo cargar el empleado")
          }
          return
        }

        const mappedEmployee: EmployeeDetail = {
          id: data.id,
          terminalCode: data.terminalCode,
          firstName: data.firstName,
          lastName: data.lastName,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          email: data.email,
          phone: data.phone || "",
          area: data.area,
          status: data.status,
          hireDate: data.hireDate,
          contractType: data.contractType,
          weeklyHours: Number(data.weeklyHours || 48),
        }

        const mappedShifts: EmployeeShift[] = (data.shifts || []).map((shift: any) => ({
          id: shift.id,
          date: new Date(shift.date).toISOString().slice(0, 10),
          status: shift.status,
          positionName: shift.position?.name || "Sin puesto",
          startTime: shift.timeSlot?.startTime || "00:00",
          endTime: shift.timeSlot?.endTime || "00:00",
        }))

        setEmployee(mappedEmployee)
        setEmployeeShifts(mappedShifts)
        setFormData({
          firstName: mappedEmployee.firstName,
          lastName: mappedEmployee.lastName,
          documentType: mappedEmployee.documentType,
          documentNumber: mappedEmployee.documentNumber,
          email: mappedEmployee.email,
          phone: mappedEmployee.phone || "",
          area: mappedEmployee.area,
          contractType: mappedEmployee.contractType,
          weeklyHours: mappedEmployee.weeklyHours,
        })
      } catch {
        toast.error("Error cargando detalle del empleado")
      } finally {
        setLoading(false)
      }
    }

    loadEmployee()
  }, [id])

  function handleSave() {
    toast.info("Edición de empleado pendiente de implementación")
  }

  async function handleDeleteEmployee() {
    const ok = window.confirm("¿Seguro que deseas eliminar este empleado? Esta acción no se puede deshacer.")
    if (!ok) return

    try {
      const res = await fetch(`/api/employees/${employee.id}`, { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || "No se pudo eliminar el empleado")
        return
      }

      toast.success("Empleado eliminado correctamente")
      router.push("/empleados")
      router.refresh()
    } catch {
      toast.error("Error de red al eliminar empleado")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Cargando empleado...</p>
      </div>
    )
  }

  if (notFound || !employee) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Empleado no encontrado.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-muted-foreground">{employee.terminalCode} - {employee.area}</p>
        </div>
        <StatusBadge status={employee.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacion Personal</CardTitle>
              <CardDescription>Datos basicos del empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Nombres</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Apellidos</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tipo de Documento</Label>
                  <Input value={formData.documentType} readOnly className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Numero de Documento</Label>
                  <Input value={formData.documentNumber} readOnly className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Correo Electronico</Label>
                  <Input type="email" value={formData.email} readOnly className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Telefono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Area</Label>
                  <Input value={formData.area} readOnly className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tipo de Contrato</Label>
                  <Input value={formData.contractType} readOnly className="bg-muted" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Horas Semanales</Label>
                  <Input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="destructive" onClick={handleDeleteEmployee}>
                  Eliminar Empleado
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Turnos Recientes</CardTitle>
              <CardDescription>{employeeShifts.length} turnos asignados</CardDescription>
            </CardHeader>
            <CardContent>
              {employeeShifts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin turnos asignados.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {employeeShifts.map((shift) => (
                    <div key={shift.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{shift.positionName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })} {shift.startTime}-{shift.endTime}
                        </p>
                      </div>
                      <StatusBadge status={shift.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacion Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Fecha de ingreso</dt>
                  <dd className="font-medium">{new Date(employee.hireDate).toLocaleDateString("es-CO")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Codigo terminal</dt>
                  <dd className="font-mono font-medium">{employee.terminalCode}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd><StatusBadge status={employee.status} /></dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
