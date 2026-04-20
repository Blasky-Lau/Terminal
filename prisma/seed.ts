import bcrypt from 'bcryptjs'
import { PrismaClient, UserRole, DocumentType, EmployeeStatus, ContractType, ShiftStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const directorData = {
    name: 'Carlos Ramirez',
    email: 'director@terminal.co',
    role: UserRole.director,
    terminalCode: 'TTP-DIR-001',
    position: 'Director General',
    phone: '+57 310 555 0001',
  }

  const directorHashedPassword = await bcrypt.hash('password123', 12)

  await prisma.user.upsert({
    where: { email: directorData.email },
    update: {
      name: directorData.name,
      role: directorData.role,
      terminalCode: directorData.terminalCode,
      position: directorData.position,
      phone: directorData.phone,
      hashedPassword: directorHashedPassword,
      registrationMode: 'director_created',
      approvalStatus: 'approved',
      approvedAt: new Date(),
    },
    create: {
      ...directorData,
      hashedPassword: directorHashedPassword,
      registrationMode: 'director_created',
      approvalStatus: 'approved',
      approvedAt: new Date(),
    },
  })

  const directorUser = await prisma.user.findUnique({
    where: { email: 'director@terminal.co' },
    select: { id: true },
  })

  if (!directorUser) {
    throw new Error('No se pudo obtener usuario director para crear turnos')
  }

  const posId = 'pos-taquilla'
  await prisma.position.upsert({
    where: { id: posId },
    update: {},
    create: {
      id: posId,
      name: 'Operador de Taquilla',
      area: 'Taquilla',
      description: 'Atencion en taquillas de venta de tiquetes',
      requiredStaff: 2,
    },
  })

  const timeSlotsData = [
    { id: 'ts-manana', name: 'Mañana', startTime: '05:00', endTime: '13:00' },
    { id: 'ts-tarde', name: 'Tarde', startTime: '13:00', endTime: '21:00' },
  ]

  for (const tsData of timeSlotsData) {
    await prisma.timeSlot.upsert({
      where: { id: tsData.id },
      update: {},
      create: { ...tsData, positionId: posId },
    })
  }

  const empId = 'emp-andres'
  await prisma.employee.upsert({
    where: { id: empId },
    update: {},
    create: {
      id: empId,
      terminalCode: 'TTP-EMP-001',
      firstName: 'Andres Felipe',
      lastName: 'Torres',
      documentType: DocumentType.CC,
      documentNumber: '12345678',
      email: 'andres.torres@terminal.co',
      phone: '+57 310 555 0003',
      area: 'Taquilla',
      status: EmployeeStatus.activo,
      hireDate: new Date('2024-01-15'),
      contractType: ContractType.indefinido,
      weeklyHours: 48,
    },
  })

  await prisma.shift.upsert({
    where: { id: 'shf-ejemplo-1' },
    update: {},
    create: {
      id: 'shf-ejemplo-1',
      employeeId: empId,
      positionId: posId,
      timeSlotId: 'ts-manana',
      date: new Date('2026-02-17'),
      status: ShiftStatus.publicado,
      createdBy: directorUser.id,
    },
  })

  console.log('Seed completado: Usuarios, Position, TimeSlots, Employee, Shift creados.')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
