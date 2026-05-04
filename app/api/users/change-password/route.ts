import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

type ChangePasswordBody = {
  userId: string
  currentPassword: string
  newPassword: string
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as ChangePasswordBody
    const { userId, currentPassword, newPassword } = body

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
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

    const isCurrentValid = await bcrypt.compare(String(currentPassword), user.hashedPassword)
    if (!isCurrentValid) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 401 })
    }

    const isSamePassword = await bcrypt.compare(String(newPassword), user.hashedPassword)
    if (isSamePassword) {
      return NextResponse.json(
        { error: "La nueva contraseña debe ser diferente a la actual" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 12)

    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    })

    return NextResponse.json({ message: "Contraseña actualizada correctamente" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
