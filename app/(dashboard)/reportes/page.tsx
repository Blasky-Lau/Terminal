"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, FileSpreadsheet, FileText, BarChart3, TrendingUp } from "lucide-react"
import { toast } from "sonner"

const COLORS = ["hsl(199, 89%, 36%)", "hsl(172, 66%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(215, 25%, 65%)"]

const attendanceData = [
  { date: "Lun 10", presentes: 14, ausentes: 1, tarde: 0 },
  { date: "Mar 11", presentes: 13, ausentes: 2, tarde: 1 },
  { date: "Mie 12", presentes: 14, ausentes: 1, tarde: 0 },
  { date: "Jue 13", presentes: 12, ausentes: 2, tarde: 1 },
  { date: "Vie 14", presentes: 13, ausentes: 1, tarde: 1 },
  { date: "Sab 15", presentes: 8, ausentes: 0, tarde: 0 },
]

const absencesByType = [
  { type: "Vacaciones", count: 3 },
  { type: "Enfermedad", count: 5 },
  { type: "Permiso", count: 4 },
  { type: "Calamidad", count: 1 },
  { type: "Injustificada", count: 1 },
]

const hoursWorked = [
  { employee: "Andres Torres", hours: 48, goal: 48 },
  { employee: "Laura Gutierrez", hours: 46, goal: 48 },
  { employee: "Diego Cardona", hours: 48, goal: 48 },
  { employee: "Valentina Rios", hours: 40, goal: 48 },
  { employee: "Santiago Mejia", hours: 48, goal: 48 },
  { employee: "Julian Ospina", hours: 44, goal: 48 },
  { employee: "Daniela Castrillon", hours: 48, goal: 48 },
  { employee: "Mateo Giraldo", hours: 36, goal: 48 },
]

const coverageData = [
  { position: "Taquilla", covered: 12, uncovered: 2 },
  { position: "Acceso", covered: 10, uncovered: 1 },
  { position: "Plataforma", covered: 14, uncovered: 0 },
  { position: "Atencion", covered: 9, uncovered: 2 },
  { position: "Vigilancia", covered: 14, uncovered: 0 },
  { position: "Aseo", covered: 7, uncovered: 0 },
]

const weeklyTrend = [
  { week: "Sem 1", asistencia: 95, cobertura: 92 },
  { week: "Sem 2", asistencia: 93, cobertura: 88 },
  { week: "Sem 3", asistencia: 97, cobertura: 95 },
  { week: "Sem 4", asistencia: 94, cobertura: 91 },
  { week: "Sem 5", asistencia: 96, cobertura: 93 },
  { week: "Sem 6", asistencia: 92, cobertura: 89 },
]

export default function ReportesPage() {
  const [dateFrom, setDateFrom] = useState("2026-02-10")
  const [dateTo, setDateTo] = useState("2026-02-16")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reportes Operativos</h1>
          <p className="text-muted-foreground">Analisis de asistencia, cobertura y desempeno del personal.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Exportar PDF (demo)")}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => toast.info("Exportar Excel (demo)")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Desde</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Hasta</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
          </div>
          <Select defaultValue="todas">
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las areas</SelectItem>
              <SelectItem value="taquillas">Taquillas</SelectItem>
              <SelectItem value="accesos">Accesos</SelectItem>
              <SelectItem value="plataforma">Plataforma</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary">Filtrar</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="asistencia">
        <TabsList>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          <TabsTrigger value="ausencias">Ausencias</TabsTrigger>
          <TabsTrigger value="horas">Horas Trabajadas</TabsTrigger>
          <TabsTrigger value="cobertura">Cobertura</TabsTrigger>
        </TabsList>

        <TabsContent value="asistencia" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Asistencia Diaria
                </CardTitle>
                <CardDescription>Presentes, ausentes y tardanzas por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={attendanceData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }} />
                    <Bar dataKey="presentes" name="Presentes" fill={COLORS[0]} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ausentes" name="Ausentes" fill={COLORS[3]} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="tarde" name="Tarde" fill={COLORS[2]} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Tendencia Semanal
                </CardTitle>
                <CardDescription>Porcentaje ultimas 6 semanas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="asistencia" name="Asistencia %" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="cobertura" name="Cobertura %" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ausencias" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ausencias por Tipo</CardTitle>
                <CardDescription>Distribucion del ultimo mes</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={absencesByType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count" nameKey="type">
                      {absencesByType.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <CardContent className="flex flex-wrap gap-3 border-t pt-4">
                {absencesByType.map((item, i) => (
                  <div key={item.type} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{item.type}: {item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalle de Ausencias</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">% del Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {absencesByType.map((item) => {
                      const total = absencesByType.reduce((s, i) => s + i.count, 0)
                      return (
                        <TableRow key={item.type}>
                          <TableCell className="font-medium">{item.type}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{Math.round((item.count / total) * 100)}%</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="horas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horas Trabajadas por Empleado</CardTitle>
              <CardDescription>Comparacion con meta semanal (48h)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={hoursWorked} layout="vertical" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(214, 20%, 88%)" />
                  <XAxis type="number" domain={[0, 56]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="employee" type="category" width={120} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }} />
                  <Bar dataKey="hours" name="Horas" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cobertura" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cobertura por Puesto</CardTitle>
              <CardDescription>Turnos cubiertos vs descubiertos esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={coverageData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="position" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214, 20%, 88%)", fontSize: 12 }} />
                  <Bar dataKey="covered" name="Cubiertos" fill={COLORS[1]} radius={[3, 3, 0, 0]} stackId="a" />
                  <Bar dataKey="uncovered" name="Descubiertos" fill={COLORS[3]} radius={[3, 3, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
