import React from "react";

export default function ProyectoPage() {
  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Documento Técnico del Proyecto Final
        </h1>
        <p className="text-muted-foreground">
          Plataforma de gestión operativa — enfoque académico (tecnólogo en
          desarrollo de software).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          1) Definición de la arquitectura del sistema
        </h2>
        <p>
          La solución se implementa bajo una <strong>arquitectura web en capas</strong>,
          organizada para separar responsabilidades y facilitar mantenimiento,
          escalabilidad y pruebas.
        </p>
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-medium">a) Capa de Presentación (Frontend)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Implementada con <strong>Next.js (App Router)</strong> y TypeScript.</li>
              <li>
                Incluye pantallas de login, primer ingreso, dashboard, empleados,
                turnos, horarios, confirmaciones y configuración.
              </li>
              <li>
                Uso de componentes reutilizables en <code>components/ui</code> para
                consistencia visual.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium">b) Capa de Lógica de Negocio (Backend/API)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>APIs en rutas <code>app/api/**</code>.</li>
              <li>
                Endpoints para autenticación, empleados, turnos, usuarios y chat.
              </li>
              <li>
                Validación de entrada y aplicación de reglas de negocio por módulo.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium">c) Capa de Datos (Persistencia)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Base de datos relacional con <strong>Prisma ORM</strong>.</li>
              <li><code>prisma/schema.prisma</code> define modelos y relaciones.</li>
              <li><code>lib/prisma.ts</code> centraliza la conexión.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium">d) Flujo general</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>El usuario interactúa con la interfaz web.</li>
              <li>El frontend consume endpoints API.</li>
              <li>La API valida y aplica reglas de negocio.</li>
              <li>Prisma consulta/actualiza la base de datos.</li>
              <li>La UI renderiza respuesta y estado actualizado.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          2) Definición de Componentes (módulos)
        </h2>

        <article className="space-y-2">
          <h3 className="text-xl font-medium">2.1 Módulo de Autenticación y Control de Acceso</h3>
          <p>
            Responsabilidades: inicio de sesión, primer ingreso, cambio de
            contraseña obligatorio y manejo de contexto de autenticación.
          </p>
          <p className="text-sm text-muted-foreground">
            Referencias: <code>app/api/auth/login/route.ts</code>,{" "}
            <code>app/api/auth/first-access/route.ts</code>,{" "}
            <code>app/login/page.tsx</code>, <code>app/primer-ingreso/page.tsx</code>,{" "}
            <code>lib/auth-context.tsx</code>.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-xl font-medium">2.2 Módulo de Gestión de Empleados</h3>
          <p>
            Responsabilidades: CRUD de empleados, consulta de detalle y
            preferencias.
          </p>
          <p className="text-sm text-muted-foreground">
            Referencias: <code>app/api/employees/route.ts</code>,{" "}
            <code>app/api/employees/[id]/route.ts</code>,{" "}
            <code>app/(dashboard)/empleados/page.tsx</code>,{" "}
            <code>app/(dashboard)/empleados/[id]/page.tsx</code>,{" "}
            <code>app/(dashboard)/empleados/nuevo/page.tsx</code>.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-xl font-medium">2.3 Módulo de Gestión de Turnos y Horarios</h3>
          <p>
            Responsabilidades: administración de turnos, generación automática,
            publicación y seguimiento.
          </p>
          <p className="text-sm text-muted-foreground">
            Referencias: <code>app/api/shifts/route.ts</code>,{" "}
            <code>app/api/shifts/[id]/route.ts</code>,{" "}
            <code>app/api/shifts/generate/route.ts</code>,{" "}
            <code>app/(dashboard)/turnos/page.tsx</code>,{" "}
            <code>app/(dashboard)/horarios/page.tsx</code>.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-xl font-medium">2.4 Módulo de Dashboard y Monitoreo</h3>
          <p>
            Responsabilidades: visualización de indicadores (KPIs), alertas y
            estado operativo.
          </p>
          <p className="text-sm text-muted-foreground">
            Referencias: <code>app/(dashboard)/dashboard/page.tsx</code>,{" "}
            <code>components/kpi-card.tsx</code>,{" "}
            <code>components/notification-popover.tsx</code>,{" "}
            <code>components/status-badge.tsx</code>.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-xl font-medium">2.5 Módulo de Comunicación Interna (Chat)</h3>
          <p>
            Responsabilidades: usuarios disponibles, conversaciones y envío de
            mensajes.
          </p>
          <p className="text-sm text-muted-foreground">
            Referencias: <code>app/api/chat/users/route.ts</code>,{" "}
            <code>app/api/chat/conversations/route.ts</code>,{" "}
            <code>app/api/chat/messages/route.ts</code>.
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3) Diseño de la interfaz de usuario (UI)</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Consistencia visual:</strong> biblioteca de componentes
            reutilizables.
          </li>
          <li>
            <strong>Jerarquía:</strong> dashboard con indicadores principales y
            accesos rápidos.
          </li>
          <li>
            <strong>Navegación:</strong> sidebar y encabezado de dashboard para
            flujo claro.
          </li>
          <li>
            <strong>Feedback:</strong> badges, notificaciones y validaciones en
            formularios.
          </li>
          <li>
            <strong>Usabilidad:</strong> separación por módulos para reducir carga
            cognitiva.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4) Demás especificaciones técnicas</h2>
        <div className="space-y-2">
          <p>
            <strong>Stack:</strong> Next.js, React, TypeScript, Prisma ORM,
            Tailwind CSS.
          </p>
          <p>
            <strong>Estructura:</strong> APIs en <code>app/api</code>, vistas en{" "}
            <code>app/(dashboard)</code>, utilidades en <code>lib</code>,
            componentes en <code>components</code>.
          </p>
          <p>
            <strong>Persistencia:</strong> modelado y migraciones con Prisma.
          </p>
          <p>
            <strong>Despliegue:</strong> guía de comandos en{" "}
            <code>COMANDOS_EC2_DESPLIEGUE.txt</code>.
          </p>
          <p>
            <strong>Mantenibilidad:</strong> separación de responsabilidades y
            tipado estricto.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5) Seguridad y escalabilidad</h2>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">5.1 Seguridad</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Control de acceso por autenticación y rutas protegidas.</li>
            <li>
              Flujo de primer ingreso con cambio de contraseña obligatorio.
            </li>
            <li>Validación de datos de entrada en endpoints API.</li>
            <li>Aplicación del principio de mínimo privilegio.</li>
            <li>Protección de datos sensibles y cumplimiento legal (Ley 1581).</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-medium">5.2 Escalabilidad</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Arquitectura modular para evolución incremental.</li>
            <li>APIs desacopladas que facilitan escalado horizontal.</li>
            <li>Optimización de consultas e índices de base de datos.</li>
            <li>Posibilidad futura de separar módulos en microservicios.</li>
            <li>Reutilización de componentes para crecimiento sostenido del UI.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3 border-t pt-6">
        <h2 className="text-2xl font-semibold">Conclusión</h2>
        <p>
          La arquitectura propuesta consolida una solución moderna, mantenible y
          escalable para la operación de turnos y gestión de talento humano.
          Gracias al enfoque modular y al uso de tecnologías actuales, el sistema
          puede crecer con bajo acoplamiento, manteniendo seguridad, trazabilidad
          y buena experiencia de usuario.
        </p>
      </section>
    </main>
  );
}
