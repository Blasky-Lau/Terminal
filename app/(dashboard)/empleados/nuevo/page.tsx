"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    terminalCode: "",
    firstName: "",
    lastName: "",
    documentType: "CC",
    documentNumber: "",
    email: "",
    phone: "",
    contractType: "indefinido" as "fijo" | "indefinido" | "prestacion",
    weeklyHours: 48,
    workPreference: "any" as "any" | "night_weekdays_only",
    unavailableDates: [] as string[],
  })
  const [vacationInput, setVacationInput] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const invalidNoticeDate = formData.unavailableDates.find((d) => {
      const requested = new Date(`${d}T00:00:00`)
      if (Number.isNaN(requested.getTime())) return true
      const diffMs = requested.getTime() - today.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return diffDays < 3
    })

    if (invalidNoticeDate) {
      toast.error("Los días no disponibles deben solicitarse con mínimo 3 días de anticipación.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data?.error ?? "No se pudo registrar el empleado")
        return
      }

      const generatedEmail = data?.credentials?.email
      const generatedPassword = data?.credentials?.temporaryPassword

      if (generatedEmail && generatedPassword) {
        alert(
          `Empleado y usuario creados correctamente.\n\nCredenciales de acceso:\nUsuario: ${generatedEmail}\nContraseña temporal: ${generatedPassword}\n\nGuárdalas antes de continuar.`
        )
      }

      toast.success("Empleado y usuario creados correctamente")
      router.push("/empleados")
      router.refresh()
    } catch {
      toast.error("Error de red al registrar empleado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nuevo Empleado</h1>
          <p className="text-muted-foreground">Registrar un nuevo empleado en el sistema.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Datos del Empleado</CardTitle>
          <CardDescription>Completa la informacion del nuevo empleado.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="terminalCode">Codigo de Empleado</Label>
                <Input
                  id="terminalCode"
                  value={formData.terminalCode}
                  onChange={(e) => setFormData({ ...formData, terminalCode: e.target.value })}
                  placeholder="Ej: EMP-001"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">Nombres</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tipo de Documento</Label>
                <Select value={formData.documentType} onValueChange={(v) => setFormData({ ...formData, documentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">C.C.</SelectItem>
                    <SelectItem value="CE">C.E.</SelectItem>
                    <SelectItem value="TI">T.I.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="doc">Numero de Documento</Label>
                <Input
                  id="doc"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo Electronico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tipo de Contrato</Label>
                <Select value={formData.contractType} onValueChange={(v: "fijo" | "indefinido" | "prestacion") => setFormData({ ...formData, contractType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fijo">Termino Fijo</SelectItem>
                    <SelectItem value="indefinido">Indefinido</SelectItem>
                    <SelectItem value="prestacion">Prestacion de Servicios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="hours">Horas Semanales</Label>
                <Input
                  id="hours"
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Preferencia de Jornada</Label>
                <Select
                  value={formData.workPreference}
                  onValueChange={(v: "any" | "night_weekdays_only") => setFormData({ ...formData, workPreference: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Sin restricción</SelectItem>
                    <SelectItem value="night_weekdays_only">Solo noche entre semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="vacationDay">Días no disponibles (vacaciones/ausencias)</Label>
                <div className="flex gap-2">
                  <Input
                    id="vacationDay"
                    type="date"
                    value={vacationInput}
                    onChange={(e) => setVacationInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!vacationInput) return
                      if (formData.unavailableDates.includes(vacationInput)) return
                      setFormData({
                        ...formData,
                        unavailableDates: [...formData.unavailableDates, vacationInput].sort(),
                      })
                      setVacationInput("")
                    }}
                  >
                    Agregar día
                  </Button>
                </div>
                {formData.unavailableDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.unavailableDates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className="rounded-md border px-2 py-1 text-xs"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            unavailableDates: formData.unavailableDates.filter((x) => x !== d),
                          })
                        }
                      >
                        {d} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Registrar Empleado"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
