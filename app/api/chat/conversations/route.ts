import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, isOnline: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const data = conversations.map((conv) => {
      const last = conv.messages[0]
      return {
        id: conv.id,
        name: conv.name,
        type: conv.type,
        participants: conv.participants.map((p) => p.userId),
        lastMessage: last?.content ?? "",
        lastMessageTime: (last?.createdAt ?? conv.createdAt).toISOString(),
        unreadCount: 0,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type CreateConversationBody = {
  name?: string
  type?: "individual" | "grupo"
  participantIds: string[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateConversationBody
    const { name, type = "individual", participantIds } = body

    if (!participantIds || participantIds.length < 2) {
      return NextResponse.json({ error: "Se requieren al menos 2 participantes" }, { status: 400 })
    }

    const uniqueParticipantIds = [...new Set(participantIds)]

    if (uniqueParticipantIds.length < 2) {
      return NextResponse.json({ error: "Se requieren al menos 2 participantes únicos" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        id: { in: uniqueParticipantIds },
        approvalStatus: "approved",
      },
      select: { id: true, name: true },
    })

    if (users.length !== uniqueParticipantIds.length) {
      return NextResponse.json({ error: "Hay participantes inválidos o inactivos" }, { status: 400 })
    }

    if (type === "individual" && uniqueParticipantIds.length === 2) {
      const existing = await prisma.conversation.findFirst({
        where: {
          type: "individual",
          participants: {
            every: {
              userId: { in: uniqueParticipantIds },
            },
          },
          AND: [
            {
              participants: {
                some: { userId: uniqueParticipantIds[0] },
              },
            },
            {
              participants: {
                some: { userId: uniqueParticipantIds[1] },
              },
            },
          ],
        },
        include: {
          participants: true,
        },
      })

      if (existing && existing.participants.length === 2) {
        return NextResponse.json(existing, { status: 200 })
      }
    }

    const defaultName =
      type === "grupo"
        ? (name?.trim() || "Grupo")
        : users.map((u) => u.name).join(", ")

    const conversation = await prisma.conversation.create({
      data: {
        name: defaultName,
        type,
        participants: {
          create: uniqueParticipantIds.map((userId) => ({ userId })),
        },
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
