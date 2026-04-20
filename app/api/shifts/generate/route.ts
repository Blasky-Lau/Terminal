import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type ShiftStatusInput = "borrador" | "publicado"

function getWeekDates(baseDate?: string): Date[] {
  const now = baseDate ? new Date(baseDate) : new Date()
  const day = now.getDay() // 0=domingo, 1=lunes...
  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() + diffToMonday)

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      status?: ShiftStatusInput
      createdBy?: string
      weekStart?: string
    }

    const status: ShiftStatusInput = body.status === "publicado" ? "publicado" : "borrador"

    const creator =
      body.createdBy ||
      (
        await prisma.user.findFirst({
          where: { role: "director" },
          select: { id: true },
        })
      )?.id

    if (!creator) {
      return NextResponse.json(
        { error: "No se encontró usuario creador. Envía createdBy o crea un director." },
        { status: 400 }
      )
    }

    const [positions, employees] = await Promise.all([
      prisma.position.findMany({
        where: { isActive: true },
        include: { timeSlots: true },
        orderBy: { name: "asc" },
      }),
      prisma.employee.findMany({
        where: { status: "activo" },
        orderBy: { createdAt: "asc" },
      }),
    ])

    if (!positions.length) {
      return NextResponse.json({ error: "No hay puestos activos para generar horarios." }, { status: 400 })
    }

    if (!employees.length) {
      return NextResponse.json({ error: "No hay empleados activos para asignar turnos." }, { status: 400 })
    }

    const weekDates = getWeekDates(body.weekStart)
    const weekStart = weekDates[0]
    const weekEnd = weekDates[6]
    const unavailableByEmployee = new Map<string, Set<string>>()

    for (const emp of employees) {
      const raw = Array.isArray(emp.unavailableDates) ? (emp.unavailableDates as string[]) : []
      unavailableByEmployee.set(emp.id, new Set(raw))
    }

    const weeklyDayOffByEmployee = new Map<string, string>()
    for (let idx = 0; idx < employees.length; idx++) {
      const emp = employees[idx]
      const dayOffIndex = idx % weekDates.length
      const dayOffDate = weekDates[dayOffIndex].toISOString().slice(0, 10)
      weeklyDayOffByEmployee.set(emp.id, dayOffDate)

      const unavailable = unavailableByEmployee.get(emp.id) ?? new Set<string>()
      unavailable.add(dayOffDate)
      unavailableByEmployee.set(emp.id, unavailable)
    }

    let employeeCursor = 0
    const toCreate: {
      employeeId: string
      positionId: string
      timeSlotId: string
      date: Date
      status: ShiftStatusInput
      createdBy: string
    }[] = []

    const assignedByEmployeeAndDay = new Set<string>() // employeeId|YYYY-MM-DD
    const lastShiftTypeByEmployee = new Map<string, "night" | "other">()

    for (const date of weekDates) {
      const isoDate = date.toISOString().slice(0, 10)

      const positionSlots = positions.map((position) => ({
        position,
        slots: [...position.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }))

      for (const { position, slots } of positionSlots) {
        const requiredPerSlot = Math.max(1, Number(position.requiredStaff || 1))

        for (const slot of slots) {
          for (let i = 0; i < requiredPerSlot; i++) {
            let attempts = 0
            let assigned = false

            while (attempts < employees.length && !assigned) {
              const candidate = employees[employeeCursor % employees.length]
              employeeCursor += 1
              attempts += 1

              const employeeDayKey = `${candidate.id}|${isoDate}`
              if (assignedByEmployeeAndDay.has(employeeDayKey)) continue

              const unavailable = unavailableByEmployee.get(candidate.id)
              if (unavailable?.has(isoDate)) continue

              const dayOfWeek = date.getDay()
              const startsAt = slot.startTime || "00:00"
              const hour = Number(startsAt.split(":")[0] || "0")
              const isNight = hour >= 18 || hour < 6
              const isMorning = hour >= 4 && hour < 12
              const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5

              if (candidate.workPreference === "night_weekdays_only") {
                if (!(isNight && isWeekday)) continue
              }

              if (isMorning && lastShiftTypeByEmployee.get(candidate.id) === "night") {
                continue
              }

              toCreate.push({
                employeeId: candidate.id,
                positionId: position.id,
                timeSlotId: slot.id,
                date,
                status,
                createdBy: creator,
              })

              assignedByEmployeeAndDay.add(employeeDayKey)
              lastShiftTypeByEmployee.set(candidate.id, isNight ? "night" : "other")
              assigned = true
            }
          }
        }
      }
    }

    if (!toCreate.length) {
      return NextResponse.json({ error: "No se pudieron generar turnos con las reglas actuales." }, { status: 400 })
    }

    const [deleteResult] = await prisma.$transaction([
      prisma.shift.deleteMany({
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      }),
      prisma.shift.createMany({
        data: toCreate,
      }),
    ])

    return NextResponse.json({
      message: "Horarios generados correctamente",
      generated: toCreate.length,
      deletedPrevious: deleteResult.count,
      weekStart,
      weekEnd,
      status,
      guaranteedDayOffEmployees: employees.length,
      weeklyDayOffByEmployee: Object.fromEntries(weeklyDayOffByEmployee),
    })
  } catch {
    return NextResponse.json({ error: "Error generando horarios" }, { status: 500 })
  }
}
