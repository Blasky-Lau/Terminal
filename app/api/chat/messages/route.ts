import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId es requerido" }, { status: 400 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    const data = messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      isRead: msg.isRead,
    }))

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type CreateMessageBody = {
  conversationId: string
  senderId: string
  content: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateMessageBody
    const { conversationId, senderId, content } = body

    if (!conversationId || !senderId || !content?.trim()) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: senderId,
      },
      select: { id: true },
    })

    if (!participant) {
      return NextResponse.json({ error: "Usuario no pertenece a la conversación" }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.sender.name,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      isRead: message.isRead,
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
