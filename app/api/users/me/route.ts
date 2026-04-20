import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type UpdateMeBody = {
  userId: string
  name?: string
  email?: string
  phone?: string
  terminalCode?: string
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as UpdateMeBody
    const { userId, name, email, phone, terminalCode } = body

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (email) {
      const dupEmail = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
        select: { id: true },
      })
      if (dupEmail) {
        return NextResponse.json({ error: "El correo ya está en uso" }, { status: 409 })
      }
    }

    if (terminalCode && existing.role === "director") {
      const dupCode = await prisma.user.findFirst({
        where: { terminalCode, id: { not: userId } },
        select: { id: true },
      })
      if (dupCode) {
        return NextResponse.json({ error: "El código ya está en uso" }, { status: 409 })
      }
    }

    const data: {
      name?: string
      email?: string
      phone?: string | null
      terminalCode?: string
    } = {}

    if (typeof name === "string") data.name = name.trim()
    if (typeof email === "string") data.email = email.trim().toLowerCase()
    if (typeof phone === "string") data.phone = phone.trim() || null
    if (typeof terminalCode === "string" && existing.role === "director") data.terminalCode = terminalCode.trim()

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        terminalCode: true,
        position: true,
        phone: true,
        isOnline: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
