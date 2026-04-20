import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
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

