import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

type FirstAccessBody = {
  userId: string
  currentPassword: string
  newPassword: string
  acceptDataPolicy: boolean
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FirstAccessBody
    const { userId, currentPassword, newPassword, acceptDataPolicy } = body

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    if (!acceptDataPolicy) {
      return NextResponse.json(
        { error: "Debes aceptar el tratamiento de datos personales para continuar" },
        { status: 400 }
      )
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.hashedPassword) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(String(currentPassword), user.hashedPassword)
    if (!isValid) {
      return NextResponse.json({ error: "Contraseña temporal inválida" }, { status: 401 })
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 12)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword,
        mustChangePassword: false,
        dataPolicyAcceptedAt: new Date(),
        dataPolicyVersion: user.dataPolicyVersion ?? "ley_1581_2012_v1",
      },
    })

    return NextResponse.json({
      message: "Primer ingreso completado correctamente",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        terminalCode: updatedUser.terminalCode,
        position: updatedUser.position ?? undefined,
        phone: updatedUser.phone ?? undefined,
        isOnline: updatedUser.isOnline ?? false,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
