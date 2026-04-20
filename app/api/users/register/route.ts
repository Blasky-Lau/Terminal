import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

type RegisterMode = "self_service" | "director_created"

type RegisterBody = {
  name: string
  email: string
  password: string
  role: "director" | "supervisor" | "empleado"
  terminalCode: string
  phone?: string
  registrationMode?: RegisterMode
  actorUserId?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody
    const {
      name,
      email,
      password,
      role,
      terminalCode,
      phone,
      registrationMode = "self_service",
      actorUserId,
    } = body

    if (!name || !email || !password || !role || !terminalCode) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    if (role === "director") {
      const existingDirector = await prisma.user.findFirst({ where: { role: "director" } })
      if (existingDirector) {
        return NextResponse.json({ error: "Ya existe un único director operativo" }, { status: 409 })
      }
    }

    let creatorDirectorId: string | null = null

    if (registrationMode === "director_created") {
      if (!actorUserId) {
        return NextResponse.json({ error: "actorUserId es requerido para registro por director" }, { status: 400 })
      }

      const actor = await prisma.user.findUnique({
        where: { id: actorUserId },
        select: { id: true, role: true, approvalStatus: true },
      })

      if (!actor || actor.role !== "director" || actor.approvalStatus !== "approved") {
        return NextResponse.json({ error: "Solo un director operativo activo puede crear usuarios directos" }, { status: 403 })
      }

      creatorDirectorId = actor.id
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedTerminalCode = terminalCode.trim()

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { terminalCode: normalizedTerminalCode }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email o código terminal ya existe" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        hashedPassword,
        role,
        terminalCode: normalizedTerminalCode,
        phone: phone?.trim() || null,
        registrationMode,
        approvalStatus: registrationMode === "director_created" ? "approved" : "pending",
        approvedByUserId: registrationMode === "director_created" ? creatorDirectorId : null,
        approvedAt: registrationMode === "director_created" ? new Date() : null,
        createdByUserId: registrationMode === "director_created" ? creatorDirectorId : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        terminalCode: true,
        phone: true,
        registrationMode: true,
        approvalStatus: true,
      },
    })

    const message =
      registrationMode === "director_created"
        ? "Usuario creado y habilitado por dirección operativa."
        : "Usuario registrado. Pendiente de aprobación por dirección operativa."

    return NextResponse.json({ user, message }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
