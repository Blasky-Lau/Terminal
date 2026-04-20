import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type PreferenceRequestBody = {
  employeeId: string
  workPreference: "any" | "night_weekdays_only"
  unavailableDates: string[]
  requestedByUserId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreferenceRequestBody
    const { employeeId, workPreference, unavailableDates, requestedByUserId } = body

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId es requerido" }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    })

    if (!employee) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    const normalizedUnavailableDates = Array.isArray(unavailableDates)
      ? unavailableDates.map((d) => d.trim()).filter(Boolean)
      : []

    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        workPreference: workPreference === "night_weekdays_only" ? "night_weekdays_only" : "any",
        unavailableDates: normalizedUnavailableDates,
      },
    })

    const pref = await prisma.preferenceApproval.create({
      data: {
        employeeId,
        requestedById: requestedByUserId || null,
        status: "pendiente",
      },
    })

    return NextResponse.json(pref, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error solicitando aprobación de preferencias" }, { status: 500 })
  }
}
