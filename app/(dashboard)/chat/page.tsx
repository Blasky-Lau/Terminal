"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Send, Users, User, Search, ArrowLeft } from "lucide-react"
import type { ChatMessage, ChatConversation } from "@/lib/types"

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })
}

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeUsers, setActiveUsers] = useState<{ id: string; name: string; role: string; isOnline: boolean | null }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (conv) =>
          searchQuery === "" ||
          conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [conversations, searchQuery]
  )

  const conversationMessages = selectedConv
    ? messages.filter((m) => m.conversationId === selectedConv.id)
    : []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversationMessages.length, selectedConv])

  async function loadConversations(currentUserId: string) {
    const res = await fetch(`/api/chat/conversations?userId=${currentUserId}`, {
      cache: "no-store",
    })
    if (!res.ok) return
    const data = (await res.json()) as ChatConversation[]
    setConversations(data)
  }

  async function loadMessages(conversationId: string) {
    const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`, {
      cache: "no-store",
    })
    if (!res.ok) return
    const data = (await res.json()) as ChatMessage[]
    setMessages(data)
  }

  async function loadActiveUsers() {
    const res = await fetch("/api/chat/users", { cache: "no-store" })
    if (!res.ok) return
    const data = (await res.json()) as { id: string; name: string; role: string; isOnline: boolean | null }[]
    setActiveUsers(data)
  }

  useEffect(() => {
    if (!user?.id) return
    loadConversations(user.id)
    loadActiveUsers()
  }, [user?.id])

  useEffect(() => {
    if (!selectedConv?.id) return
    loadMessages(selectedConv.id)
  }, [selectedConv?.id])

  async function handleStartDirectConversation(targetUserId: string, targetUserName: string) {
    if (!user?.id || user.id === targetUserId) return

    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "individual",
        participantIds: [user.id, targetUserId],
      }),
    })

    if (!res.ok) return

    const created = await res.json()

    const conv: ChatConversation = {
      id: created.id,
      name: created.name || targetUserName,
      type: created.type || "individual",
      participants: created.participants?.map((p: { userId: string }) => p.userId) ?? [user.id, targetUserId],
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    }

    setSelectedConv(conv)
    await loadConversations(user.id)
    await loadMessages(conv.id)
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedConv || !user) return

    const content = newMessage.trim()
    setNewMessage("")

    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedConv.id,
        senderId: user.id,
        content,
      }),
    })

    if (!res.ok) return

    const created = (await res.json()) as ChatMessage
    setMessages((prev) => [...prev, created])

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConv.id
          ? {
              ...conv,
              lastMessage: created.content,
              lastMessageTime: created.timestamp,
            }
          : conv
      )
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex h-full">
        {/* Conversation list */}
        <div className={cn(
          "flex w-full flex-col border-r md:w-80 md:shrink-0",
          selectedConv && "hidden md:flex"
        )}>
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar conversacion..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="border-b p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Iniciar chat con usuarios activos</p>
            <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
              {activeUsers
                .filter((u) => u.id !== user?.id)
                .filter((u) => searchQuery === "" || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartDirectConversation(u.id, u.name)}
                    className="flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs hover:bg-muted"
                  >
                    <span className="truncate">{u.name}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground">{u.role}</span>
                  </button>
                ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={cn(
                    "flex gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-muted/50",
                    selectedConv?.id === conv.id && "bg-muted"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={conv.type === "grupo" ? "bg-primary/10 text-primary" : "bg-muted"}>
                      {conv.type === "grupo" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{conv.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs text-muted-foreground">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <Badge className="ml-1 h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[10px]">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Message area */}
        <div className={cn(
          "flex flex-1 flex-col",
          !selectedConv && "hidden md:flex"
        )}>
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConv(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={selectedConv.type === "grupo" ? "bg-primary/10 text-primary" : "bg-muted"}>
                    {selectedConv.type === "grupo" ? <Users className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedConv.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConv.type === "grupo"
                      ? `${selectedConv.participants.length} participantes`
                      : "En linea"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {conversationMessages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id
                  const showDate =
                    i === 0 ||
                    formatDate(msg.timestamp) !== formatDate(conversationMessages[i - 1].timestamp)
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="my-2 flex justify-center">
                          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={cn("flex gap-2", isMe && "flex-row-reverse")}>
                        {!isMe && (
                          <Avatar className="mt-1 h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-muted text-xs">
                              {msg.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn(
                          "max-w-[70%] rounded-2xl px-3.5 py-2",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}>
                          {!isMe && selectedConv.type === "grupo" && (
                            <p className="mb-0.5 text-xs font-medium opacity-70">{msg.senderName}</p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={cn(
                            "mt-0.5 text-right text-[10px]",
                            isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input */}
              <div className="border-t p-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend() }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Send className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Selecciona una conversacion</p>
              <p className="text-xs text-muted-foreground">Elige un chat para comenzar a enviar mensajes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
