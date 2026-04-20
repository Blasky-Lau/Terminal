export type MockShift = {
  id: string
  employeeId: string
  positionId: string
  timeSlotId: string
  date: string
  status: "borrador" | "publicado" | "confirmado" | "rechazado"
  notes?: string
}

export const mockShifts: MockShift[] = []

export function getWeekDates(baseDate = new Date()): string[] {
  const date = new Date(baseDate)
  const day = date.getDay()
  const diffToMonday = (day + 6) % 7
  date.setDate(date.getDate() - diffToMonday)

  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(date)
    d.setDate(date.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}
