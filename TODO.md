# TODO - Implementación solicitada (registro, puestos, empleados, chat)

- [x] 1. Actualizar `prisma/schema.prisma` con nuevos campos/enums:
  - Registro de usuario en dos modos (self_service / director_created)
  - Reglas avanzadas de puestos (obligatorio, prioridad, cantidad prioridad, modo cobertura dual)
  - Reglas avanzadas de puestos (obligatorio, prioridad, cantidad prioridad, modo cobertura dual)
  - Restricciones de disponibilidad en empleados (preferencia laboral y fechas no disponibles)
- [x] 2. Actualizar API de registro `app/api/users/register/route.ts`
- [x] 3. Actualizar UI de registro `app/register/page.tsx`
- [x] 4. Actualizar API de puestos `app/api/positions/route.ts`
- [x] 5. Actualizar UI de puestos `app/(dashboard)/puestos/page.tsx`
- [x] 6. Actualizar API de empleados `app/api/employees/route.ts`
- [x] 7. Actualizar UI de nuevo empleado `app/(dashboard)/empleados/nuevo/page.tsx`
- [x] 8. Agregar endpoint de usuarios activos para chat `app/api/chat/users/route.ts`
- [x] 9. Actualizar conversaciones chat `app/api/chat/conversations/route.ts` (crear/reusar conversación individual)
- [x] 10. Actualizar UI de chat `app/(dashboard)/chat/page.tsx` para mostrar todos los usuarios activos e iniciar chat directo
- [ ] 11. Ejecutar validación de tipos/build

## TODO - Generación de horarios con puestos y turnos

- [x] 1. Revisar y ajustar endpoints para usar datos reales (puestos/turnos/empleados)
- [x] 2. Crear endpoint de generación automática semanal de turnos (MVP)
- [x] 3. Implementar reglas base de asignación por `requiredStaff` y `dualCoverageMode`
- [x] 4. Conectar UI `app/(dashboard)/horarios/page.tsx` al nuevo endpoint
- [x] 5. Reemplazar consumo mock por datos reales en la vista de horarios
- [ ] 6. Validar build/tipos y comportamiento general
