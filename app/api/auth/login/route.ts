import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user?.hashedPassword) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(String(password), user.hashedPassword)
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    if (user.approvalStatus !== "approved") {
      return NextResponse.json(
        { error: "Tu cuenta aún no está aprobada por el director operativo" },
        { status: 403 }
      )
    }

    if (user.mustChangePassword) {
      return NextResponse.json({
        requiresPasswordChange: true,
        firstAccess: {
          userId: user.id,
          email: user.email,
          legalNotice: {
            title: "Tratamiento de datos personales (Ley 1581 de 2012)",
            summary:
              "Debes autorizar de forma previa y expresa el tratamiento de datos personales, conocer su finalidad y poder ejercer derechos de acceso, rectificación o eliminación conforme a la Ley 1581 de 2012.",
            authority: "Superintendencia de Industria y Comercio (SIC)",
          },
        },
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        terminalCode: user.terminalCode,
        position: user.position ?? undefined,
        phone: user.phone ?? undefined,
        isOnline: user.isOnline ?? false,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
