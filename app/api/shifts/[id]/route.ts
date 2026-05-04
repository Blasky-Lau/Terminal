import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type PatchShiftBody = {
  status?: "borrador" | "publicado" | "confirmado" | "rechazado"
  employeeId?: string
  timeSlotId?: string
  notes?: string
  actorEmployeeId?: string
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as PatchShiftBody

    const existing = await prisma.shift.findUnique({
      where: { id },
      include: { employee: true, timeSlot: true, position: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 })
    }

    if (body.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: body.employeeId },
        select: { id: true, status: true },
      })
      if (!employee || employee.status !== "activo") {
        return NextResponse.json({ error: "Empleado inválido o inactivo" }, { status: 400 })
      }
    }

    if (body.timeSlotId) {
      const timeSlot = await prisma.timeSlot.findUnique({
        where: { id: body.timeSlotId },
        select: { id: true, positionId: true },
      })
      if (!timeSlot) {
        return NextResponse.json({ error: "Franja horaria inválida" }, { status: 400 })
      }
    }

    if ((body.status === "confirmado" || body.status === "rechazado")) {
      if (!body.actorEmployeeId) {
        return NextResponse.json(
          { error: "Falta actorEmployeeId para confirmar/rechazar turno" },
          { status: 400 }
        )
      }

      if (body.actorEmployeeId !== existing.employeeId) {
        return NextResponse.json(
          { error: "Solo el empleado asignado puede confirmar o rechazar este turno" },
          { status: 403 }
        )
      }

      if (existing.status !== "publicado") {
        return NextResponse.json(
          { error: "Solo se pueden confirmar/rechazar turnos en estado publicado" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.shift.update({
      where: { id },
      data: {
        status: body.status,
        employeeId: body.employeeId,
        timeSlotId: body.timeSlotId,
        notes: body.notes,
      },
      include: {
        employee: true,
        position: true,
        timeSlot: true,
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error actualizando turno" }, { status: 500 })
  }
}
