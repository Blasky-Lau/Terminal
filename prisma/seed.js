const bcrypt = require('bcryptjs')
const { PrismaClient, UserRole, DocumentType, EmployeeStatus, ContractType, ShiftStatus } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const usersData = [
    {
      name: 'Carlos Ramirez',
      email: 'director@terminal.co',
      role: UserRole.director,
      terminalCode: 'TTP-DIR-001',
      position: 'Director General',
      phone: '+57 310 555 0001',
    },
    {
      name: 'Maria Fernanda Lopez',
      email: 'supervisor@terminal.co',
      role: UserRole.supervisor,
      terminalCode: 'TTP-SUP-001',
      position: 'Supervisora de Operaciones',
      phone: '+57 310 555 0002',
    },
    {
      name: 'Andres Felipe Torres',
      email: 'empleado@terminal.co',
      role: UserRole.empleado,
      terminalCode: 'TTP-EMP-001',
      position: 'Operador de Taquilla',
      phone: '+57 310 555 0003',
    },
  ]

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role,
        terminalCode: userData.terminalCode,
        position: userData.position,
        phone: userData.phone,
      },
      create: {
        ...userData,
        hashedPassword: await bcrypt.hash('password123', 12),
      },
    })
  }

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
      email: 'empleado@terminal.co',
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
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
