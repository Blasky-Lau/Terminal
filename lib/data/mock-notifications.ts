import type { NotificationType } from "@/lib/types"

export type MockNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
}

export const mockNotifications: MockNotification[] = []
