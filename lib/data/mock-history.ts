export type MockHistoryEntry = {
  id: string
  action: string
  entity: string
  user: string
  date: string
  details?: string
}

export const mockHistory: MockHistoryEntry[] = []
