export type MockAbsence = {
  id: string
  employeeId: string
  employeeName: string
  type: "incapacidad" | "permiso" | "vacaciones" | "licencia"
  reason: string
  startDate: string
  endDate: string
  status: "pendiente" | "aprobada" | "rechazada"
  createdAt: string
}

export const mockAbsences: MockAbsence[] = []
