"use client"

import { useAuth } from "@/lib/auth-context"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { mockEmployees } from "@/lib/data/mock-employees"
import { mockShifts } from "@/lib/data/mock-shifts"
import { mockAbsences } from "@/lib/data/mock-absences"
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

const CHART_COLORS = ["hsl(199, 89%, 36%)", "hsl(172, 66%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(215, 25%, 65%)"]

const shiftStatusData = [
  { name: "Confirmados", value: mockShifts.filter((s) => s.status === "confirmado").length },
  { name: "Publicados", value: mockShifts.filter((s) => s.status === "publicado").length },
  { name: "Borrador", value: mockShifts.filter((s) => s.status === "borrador").length },
  { name: "Rechazados", value: mockShifts.filter((s) => s.status === "rechazado").length },
]

const weeklyData = [
  { day: "Lun", turnos: 8, confirmados: 6 },
  { day: "Mar", turnos: 6, confirmados: 4 },
  { day: "Mie", turnos: 5, confirmados: 2 },
  { day: "Jue", turnos: 4, confirmados: 1 },
  { day: "Vie", turnos: 3, confirmados: 0 },
  { day: "Sab", turnos: 2, confirmados: 0 },
  { day: "Dom", turnos: 0, confirmados: 0 },
]

function DirectorDashboard() {
  const activeEmployees = mockEmployees.filter((e) => e.status === "activo").length
  const totalShifts = mockShifts.length
  const confirmedRate = Math.round((mockShifts.filter((s) => s.status === "confirmado").length / totalShifts) * 100)
  const pendingAbsences = mockAbsences.filter((a) => a.status === "pendiente").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard General</h1>
        <p className="text-muted-foreground">Vista global de las operaciones del terminal.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Empleados Activos" value={activeEmployees} change={2} changeLabel="vs mes ant." icon={Users} />
        <KPICard label="Turnos Semana" value={totalShifts} change={5} changeLabel="vs sem. ant." icon={Clock} />
        <KPICard label="Tasa Confirmacion" value={`${confirmedRate}%`} change={-3} changeLabel="vs sem. ant." icon={CheckCircle2} />
        <KPICard label="Ausencias Pend." value={pendingAbsences} icon={UserX} />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Turnos por Dia</CardTitle>
            <CardDescription>Turnos asignados vs confirmados esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }}
                />
                <Bar dataKey="turnos" name="Asignados" fill="hsl(199, 89%, 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="confirmados" name="Confirmados" fill="hsl(172, 66%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Estado de Turnos</CardTitle>
            <CardDescription>Distribucion de estados esta semana</CardDescription>
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
              <CardTitle className="text-base">Ausencias Activas</CardTitle>
              <CardDescription>Empleados ausentes o pendientes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ausencias">Ver todas <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {mockAbsences.slice(0, 3).map((absence) => (
                <div key={absence.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{absence.employeeName}</span>
                    <span className="text-xs text-muted-foreground capitalize">{absence.type} - {absence.startDate} a {absence.endDate}</span>
                  </div>
                  <StatusBadge status={absence.status} />
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
    </div>
  )
}

function EmployeeDashboard() {
  const myShifts = mockShifts.filter((s) => s.employeeId === "emp-001").slice(0, 5)
  const pendingConfirmations = myShifts.filter((s) => s.status === "publicado").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Panel</h1>
        <p className="text-muted-foreground">Resumen de tus turnos y actividades.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Mis Turnos Semana" value={myShifts.length} icon={Clock} />
        <KPICard label="Confirmados" value={myShifts.filter((s) => s.status === "confirmado").length} icon={CheckCircle2} />
        <KPICard label="Pend. Confirmacion" value={pendingConfirmations} icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Mis Turnos Esta Semana</CardTitle>
            <CardDescription>Turnos asignados para la semana actual</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/confirmaciones">Confirmar turnos <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {myShifts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No tienes turnos asignados esta semana.</p>
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
