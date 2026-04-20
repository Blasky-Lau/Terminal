export type MockEmployee = {
  id: string
  terminalCode: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  positionId?: string
  area?: string
  status: "activo" | "inactivo" | "vacaciones" | "licencia"
}

export const mockEmployees: MockEmployee[] = []
