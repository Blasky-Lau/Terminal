import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const weekStartParam = searchParams.get('weekStart')
    const weekEndParam = searchParams.get('weekEnd')

    const where =
      weekStartParam && weekEndParam
        ? {
            date: {
              gte: new Date(weekStartParam),
              lte: new Date(weekEndParam),
            },
          }
        : undefined

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        employee: true,
        position: true,
        timeSlot: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(shifts)
  } catch {
    return NextResponse.json({ error: 'Error obteniendo turnos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const shift = await prisma.shift.create({ data })
    return NextResponse.json(shift, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error creando turno' }, { status: 500 })
  }
}

