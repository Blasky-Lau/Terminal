import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type TimeSlotInput = {
  name: string
  startTime: string
  endTime: string
}

type PositionCoverageMode = "single_required" | "both_required" | "one_required"

type CreatePositionBody = {
  name: string
  area: string
  description?: string
  requiredStaff?: number
  isMandatory?: boolean
  isPriority?: boolean
  priorityStaffCount?: number
  dualCoverageMode?: PositionCoverageMode
  isActive?: boolean
  timeSlots?: TimeSlotInput[]
}

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      include: {
        timeSlots: true,
        shifts: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(positions)
  } catch {
    return NextResponse.json({ error: "Error obteniendo puestos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePositionBody
    const {
      name,
      area,
      description,
      requiredStaff,
      isMandatory,
      isPriority,
      priorityStaffCount,
      dualCoverageMode,
      isActive,
      timeSlots,
    } = body

    if (!name || !area) {
      return NextResponse.json({ error: "Nombre y área son requeridos" }, { status: 400 })
    }

    const normalizedRequiredStaff = Number(requiredStaff ?? 1)

    if (!Number.isFinite(normalizedRequiredStaff) || normalizedRequiredStaff < 1) {
      return NextResponse.json({ error: "Personal requerido debe ser mayor o igual a 1" }, { status: 400 })
    }

    const normalizedIsPriority = Boolean(isPriority)
    const normalizedPriorityStaffCount = priorityStaffCount !== undefined ? Number(priorityStaffCount) : null

    if (normalizedIsPriority && (!normalizedPriorityStaffCount || normalizedPriorityStaffCount < 1)) {
      return NextResponse.json({ error: "Si el puesto es prioridad, debe indicar cuántas personas requiere" }, { status: 400 })
    }

    if (normalizedPriorityStaffCount && normalizedPriorityStaffCount > normalizedRequiredStaff) {
      return NextResponse.json({ error: "La cantidad prioritaria no puede superar el personal requerido" }, { status: 400 })
    }

    const normalizedDualCoverageMode: PositionCoverageMode =
      normalizedRequiredStaff === 2
        ? (dualCoverageMode ?? "both_required")
        : "single_required"

    if (normalizedRequiredStaff !== 2 && dualCoverageMode && dualCoverageMode !== "single_required") {
      return NextResponse.json({ error: "La cobertura dual solo aplica cuando el personal requerido es 2" }, { status: 400 })
    }

    if (
      normalizedRequiredStaff === 2 &&
      normalizedDualCoverageMode !== "both_required" &&
      normalizedDualCoverageMode !== "one_required"
    ) {
      return NextResponse.json({ error: "Modo de cobertura dual inválido para puestos de 2 personas" }, { status: 400 })
    }

    const normalizedSlots = (timeSlots ?? [])
      .map((slot) => ({
        name: slot.name?.trim(),
        startTime: slot.startTime?.trim(),
        endTime: slot.endTime?.trim(),
      }))
      .filter((slot) => !!slot.name && !!slot.startTime && !!slot.endTime)

    const created = await prisma.position.create({
      data: {
        name: name.trim(),
        area: area.trim(),
        description: description?.trim() || null,
        requiredStaff: normalizedRequiredStaff,
        isMandatory: typeof isMandatory === "boolean" ? isMandatory : false,
        isPriority: normalizedIsPriority,
        priorityStaffCount: normalizedIsPriority ? normalizedPriorityStaffCount : null,
        dualCoverageMode: normalizedDualCoverageMode,
        isActive: typeof isActive === "boolean" ? isActive : true,
        timeSlots: normalizedSlots.length
          ? {
              create: normalizedSlots,
            }
          : undefined,
      },
      include: {
        timeSlots: true,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error creando puesto" }, { status: 500 })
  }
}
