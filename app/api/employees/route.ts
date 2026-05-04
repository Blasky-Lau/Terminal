import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

type EmployeeWorkPreference = "any" | "night_weekdays_only"

function generateTempPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"
  let pwd = ""
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

type CreateEmployeeBody = {
  terminalCode?: string
  firstName: string
  lastName: string
  documentType: "CC" | "CE" | "TI"
  documentNumber: string
  email: string
  phone?: string
  positionId?: string
  contractType: "fijo" | "indefinido" | "prestacion"
  weeklyHours: number
  workPreference?: EmployeeWorkPreference
  unavailableDates?: string[]
}

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(employees)
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateEmployeeBody
    const {
      terminalCode,
      firstName,
      lastName,
      documentType,
      documentNumber,
      email,
      phone,
      positionId,
      contractType,
      weeklyHours,
      workPreference,
      unavailableDates,
    } = body

    if (!firstName || !lastName || !documentType || !documentNumber || !email || !contractType || !weeklyHours) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    let area = "Sin asignar"

    if (positionId) {
      const position = await prisma.position.findUnique({
        where: { id: positionId },
        select: { id: true, area: true, isActive: true },
      })

      if (!position || !position.isActive) {
        return NextResponse.json({ error: "Cargo inválido o inactivo" }, { status: 400 })
      }

      area = position.area
    }

    const normalizedEmail = email.trim().toLowerCase()
    const employeeCode = terminalCode?.trim() || `EMP-${Date.now()}`

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ documentNumber }, { email: normalizedEmail }, { terminalCode: employeeCode }],
      },
      select: { id: true },
    })

    if (existingEmployee) {
      return NextResponse.json({ error: "Documento, email o código de empleado ya existe" }, { status: 409 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { terminalCode: employeeCode }],
      },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email o código terminal" },
        { status: 409 }
      )
    }

    const normalizedWorkPreference: EmployeeWorkPreference = workPreference === "night_weekdays_only" ? "night_weekdays_only" : "any"

    const normalizedUnavailableDates = Array.isArray(unavailableDates)
      ? unavailableDates
          .map((d) => d?.trim())
          .filter(Boolean)
      : []

    const tempPassword = generateTempPassword(12)
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const result = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          terminalCode: employeeCode,
          firstName,
          lastName,
          documentType,
          documentNumber,
          email: normalizedEmail,
          phone,
          area,
          contractType,
          weeklyHours: Number(weeklyHours),
          workPreference: normalizedWorkPreference,
          unavailableDates: normalizedUnavailableDates,
          hireDate: new Date(),
        },
      })

      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`.trim(),
          email: normalizedEmail,
          hashedPassword,
          role: "empleado",
          terminalCode: employeeCode,
          position: null,
          phone: phone || null,
          approvalStatus: "approved",
          registrationMode: "director_created",
          approvedAt: new Date(),
          mustChangePassword: true,
          dataPolicyVersion: "ley_1581_2012_v1",
        },
      })

      return { employee, user }
    })

    return NextResponse.json(
      {
        employee: result.employee,
        user: {
          id: result.user.id,
          email: result.user.email,
          terminalCode: result.user.terminalCode,
          role: result.user.role,
          mustChangePassword: true,
        },
        credentials: {
          email: result.user.email,
          temporaryPassword: tempPassword,
        },
        legalNotice: {
          title: "Tratamiento de datos personales (Ley 1581 de 2012)",
          summary:
            "Antes del primer uso, el empleado debe aceptar de forma expresa la política de tratamiento de datos, conocer la finalidad del uso de la información y ejercer sus derechos de acceso, rectificación y eliminación cuando aplique.",
          authority: "Superintendencia de Industria y Comercio (SIC)",
        },
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
