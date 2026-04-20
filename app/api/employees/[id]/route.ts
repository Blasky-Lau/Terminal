import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        shifts: {
          include: {
            position: true,
            timeSlot: true,
          },
          orderBy: { date: "desc" },
          take: 20,
        },
        preferenceRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            reviewedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: "Error obteniendo empleado" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, email: true, terminalCode: true },
    })

    if (!employee) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.shift.deleteMany({
        where: { employeeId: employee.id },
      })

      await tx.preferenceApproval.deleteMany({
        where: { employeeId: employee.id },
      })

      await tx.employee.delete({
        where: { id: employee.id },
      })

      await tx.user.deleteMany({
        where: {
          OR: [{ email: employee.email }, { terminalCode: employee.terminalCode }],
        },
      })
    })

    return NextResponse.json({ message: "Empleado eliminado correctamente" })
  } catch {
    return NextResponse.json({ error: "Error eliminando empleado" }, { status: 500 })
  }
}
