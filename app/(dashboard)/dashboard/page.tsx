"use client"

import { useAuth } from "@/lib/auth-context"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Users,
  Clock,
  CheckCircle2,
  UserX,
  CalendarDays,
  ArrowRight,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const CHART_COLORS = ["hsl(199, 89%, 36%)", "hsl(172, 66%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(215, 25%, 65%)"]
const DAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

type EmployeeApi = {
  id: string
  status: "activo" | "inactivo" | "vacaciones" | "licencia"
  firstName: string
  lastName: string
}

type ShiftApi = {
  id: string
  employeeId: string
  status: "borrador" | "publicado" | "confirmado" | "rechazado"
  date: string
  position?: { name: string } | null
  timeSlot?: { startTime: string; endTime: string } | null
}

function DirectorDashboard() {
  const [employees, setEmployees] = useState<EmployeeApi[]>([])
  const [shifts, setShifts] = useState<ShiftApi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [employeesRes, shiftsRes] = await Promise.all([
          fetch("/api/employees", { cache: "no-store" }),
          fetch("/api/shifts", { cache: "no-store" }),
        ])

        if (!employeesRes.ok || !shiftsRes.ok) {
          toast.error("No se pudo cargar información del dashboard")
          return
        }

        const employeesData = await employeesRes.json()
        const shiftsData = await shiftsRes.json()

        setEmployees(Array.isArray(employeesData) ? employeesData : [])
        setShifts(Array.isArray(shiftsData) ? shiftsData : [])
      } catch {
        toast.error("Error cargando dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === "activo").length,
    [employees]
  )

  const totalShifts = shifts.length
  const confirmedCount = shifts.filter((s) => s.status === "confirmado").length
  const confirmedRate = totalShifts > 0 ? Math.round((confirmedCount / totalShifts) * 100) : 0
  const pendingAbsences = employees.filter((e) => e.status === "vacaciones" || e.status === "licencia").length

  const shiftStatusData = useMemo(
    () => [
      { name: "Confirmados", value: shifts.filter((s) => s.status === "confirmado").length },
      { name: "Publicados", value: shifts.filter((s) => s.status === "publicado").length },
      { name: "Borrador", value: shifts.filter((s) => s.status === "borrador").length },
      { name: "Rechazados", value: shifts.filter((s) => s.status === "rechazado").length },
    ],
    [shifts]
  )

  const weeklyData = useMemo(() => {
    const byDay = DAY_LABELS.map((day) => ({ day, turnos: 0, confirmados: 0 }))
    for (const shift of shifts) {
      const d = new Date(shift.date)
      const idx = d.getDay()
      if (idx >= 0 && idx < byDay.length) {
        byDay[idx].turnos += 1
        if (shift.status === "confirmado") byDay[idx].confirmados += 1
      }
    }
    return byDay
  }, [shifts])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard General</h1>
        <p className="text-muted-foreground">Vista global de las operaciones del terminal.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Empleados Activos" value={activeEmployees} icon={Users} />
        <KPICard label="Turnos Semana" value={totalShifts} icon={Clock} />
        <KPICard label="Tasa Confirmacion" value={`${confirmedRate}%`} icon={CheckCircle2} />
        <KPICard label="Ausencias Pend." value={pendingAbsences} icon={UserX} />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Cargando métricas del dashboard...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-base">Turnos por Dia</CardTitle>
                <CardDescription>Turnos asignados vs confirmados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }} />
                    <Bar dataKey="turnos" name="Asignados" fill="hsl(199, 89%, 36%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="confirmados" name="Confirmados" fill="hsl(172, 66%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Estado de Turnos</CardTitle>
                <CardDescription>Distribucion de estados</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={shiftStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {shiftStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <CardContent className="flex flex-wrap gap-3 border-t pt-4">
                {shiftStatusData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Turnos Confirmados Recientes</CardTitle>
                  <CardDescription>Últimos turnos con estado confirmado</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/turnos">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {shifts.filter((s) => s.status === "confirmado").slice(0, 3).map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{shift.position?.name || "Sin puesto"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(shift.date).toLocaleDateString("es-CO")} · {shift.timeSlot?.startTime || "--:--"} a {shift.timeSlot?.endTime || "--:--"}
                        </span>
                      </div>
                      <StatusBadge status={shift.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Acciones Rapidas</CardTitle>
                  <CardDescription>Accesos directos del sistema</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" className="h-auto justify-start gap-3 px-4 py-3" asChild>
                    <Link href="/horarios">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Ver Horarios</span>
                        <span className="text-xs text-muted-foreground">Semana actual</span>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto justify-start gap-3 px-4 py-3" asChild>
                    <Link href="/reportes">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Reportes</span>
                        <span className="text-xs text-muted-foreground">Operativos</span>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto justify-start gap-3 px-4 py-3" asChild>
                    <Link href="/empleados/nuevo">
                      <Users className="h-5 w-5 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Nuevo Empleado</span>
                        <span className="text-xs text-muted-foreground">Registrar</span>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto justify-start gap-3 px-4 py-3" asChild>
                    <Link href="/ausencias">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Ausencias</span>
                        <span className="text-xs text-muted-foreground">{pendingAbsences} pendientes</span>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function EmployeeDashboard() {
  const { user } = useAuth()
  const [myShifts, setMyShifts] = useState<ShiftApi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMyShifts() {
      try {
        const res = await fetch("/api/shifts", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const all = Array.isArray(data) ? (data as any[]) : []
        const mine = all.filter((s) => s.employee?.email === user?.email)
        setMyShifts(mine)
      } finally {
        setLoading(false)
      }
    }
    loadMyShifts()
  }, [user?.email])

  const pendingShifts = myShifts.filter((s) => s.status === "publicado")
  const confirmedShifts = myShifts.filter((s) => s.status === "confirmado")
  const pendingConfirmations = pendingShifts.length
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const confirmedDays = useMemo(
    () => confirmedShifts.map((s) => new Date(s.date)),
    [confirmedShifts]
  )

  const confirmedOnSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    const key = selectedDate.toISOString().slice(0, 10)
    return confirmedShifts.filter((s) => new Date(s.date).toISOString().slice(0, 10) === key)
  }, [confirmedShifts, selectedDate])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Panel</h1>
        <p className="text-muted-foreground">Resumen de tus turnos y actividades.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Turnos Publicados" value={pendingShifts.length} icon={Clock} />
        <KPICard label="Confirmados" value={confirmedShifts.length} icon={CheckCircle2} />
        <KPICard label="Pend. Respuesta" value={pendingConfirmations} icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Turnos Publicados por Responder</CardTitle>
            <CardDescription>Aquí ves lo que publicó el director para que confirmes o reportes ausencia.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/confirmaciones">Confirmar / Ausentarse <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {loading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Cargando turnos...</p>
            ) : pendingShifts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No tienes turnos publicados pendientes.</p>
            ) : (
              pendingShifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{shift.position?.name || "Sin puesto"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" })} - {shift.timeSlot?.startTime || "--:--"} a {shift.timeSlot?.endTime || "--:--"}
                    </span>
                  </div>
                  <StatusBadge status={shift.status} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mi Horario Confirmado</CardTitle>
          <CardDescription>Calendario de turnos que ya confirmaste.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border p-4">
            <Calendar
              className="w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-head_cell]:w-14 [&_.rdp-head_cell]:text-sm [&_.rdp-cell]:h-14 [&_.rdp-cell]:w-14 [&_.rdp-day]:h-14 [&_.rdp-day]:w-14 [&_.rdp-caption_label]:text-lg"
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ confirmed: confirmedDays }}
              modifiersClassNames={{
                confirmed: "bg-emerald-100 text-emerald-900 font-semibold rounded-md",
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            {loading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Cargando horario confirmado...</p>
            ) : confirmedShifts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Aún no tienes turnos confirmados.</p>
            ) : confirmedOnSelectedDate.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No tienes turnos confirmados para la fecha seleccionada.
              </p>
            ) : (
              confirmedOnSelectedDate.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{shift.position?.name || "Sin puesto"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(shift.date).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "short" })} - {shift.timeSlot?.startTime || "--:--"} a {shift.timeSlot?.endTime || "--:--"}
                    </span>
                  </div>
                  <StatusBadge status="confirmado" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  if (user.role === "empleado") {
    return <EmployeeDashboard />
  }

  return <DirectorDashboard />
}
