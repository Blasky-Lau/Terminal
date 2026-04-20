export type MockConversation = {
  id: string
  title: string
}

export type MockMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export const mockConversations: MockConversation[] = []
export const mockMessages: MockMessage[] = []
