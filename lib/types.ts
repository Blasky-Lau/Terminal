// ============================================================
// Plataforma de Gestion Operativa - Terminal de Transporte de Pereira
// Tipos TypeScript
// ============================================================

export type UserRole = "director" | "supervisor" | "empleado"

export type ShiftStatus = "borrador" | "publicado" | "confirmado" | "rechazado"

export type AbsenceType = "enfermedad" | "calamidad" | "permiso" | "injustificada" | "vacaciones"

export type NotificationType = "turno_asignado" | "turno_modificado" | "ausencia" | "mensaje" | "sistema"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  terminalCode: string
  position?: string
  phone?: string
  isOnline?: boolean
}

export interface Employee {
  id: string
  terminalCode: string
  firstName: string
  lastName: string
  documentType: "CC" | "CE" | "TI"
  documentNumber: string
  email: string
  phone: string
  position: string
  positionId: string
  area: string
  status: "activo" | "inactivo" | "vacaciones" | "licencia"
  hireDate: string
  contractType: "fijo" | "indefinido" | "prestacion"
  weeklyHours: number
  avatar?: string
}

export interface Position {
  id: string
  name: string
  area: string
  description: string
  requiredStaff: number
  timeSlots: TimeSlot[]
  isActive: boolean
}

export interface TimeSlot {
  id: string
  name: string
  startTime: string
  endTime: string
}

export interface Shift {
  id: string
  employeeId: string
  employeeName: string
  positionId: string
  positionName: string
  date: string
  timeSlotId: string
  startTime: string
  endTime: string
  status: ShiftStatus
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Schedule {
  id: string
  weekStartDate: string
  weekEndDate: string
  status: "borrador" | "publicado"
  shifts: Shift[]
  createdBy: string
  createdAt: string
  publishedAt?: string
}

export interface Absence {
  id: string
  employeeId: string
  employeeName: string
  type: AbsenceType
  startDate: string
  endDate: string
  reason: string
  replacementId?: string
  replacementName?: string
  status: "pendiente" | "aprobada" | "rechazada"
  createdAt: string
}

export interface ChatConversation {
  id: string
  name: string
  type: "individual" | "grupo"
  participants: string[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  avatar?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  isRead: boolean
  link?: string
}

export interface HistoryEntry {
  id: string
  entityType: "empleado" | "turno" | "horario" | "puesto" | "ausencia" | "configuracion"
  entityId: string
  action: "crear" | "actualizar" | "eliminar" | "publicar"
  description: string
  userId: string
  userName: string
  timestamp: string
  changes?: { field: string; before: string; after: string }[]
}

export interface KPI {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: string
}

export interface ReportData {
  attendance: { date: string; present: number; absent: number; late: number }[]
  absencesByType: { type: string; count: number }[]
  hoursWorked: { employee: string; hours: number }[]
  shiftCoverage: { position: string; covered: number; uncovered: number }[]
}
