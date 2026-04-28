"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

type FirstAccessContext = {
  userId: string
  email: string
  currentPassword: string
  legalNotice?: {
    title: string
    summary: string
    authority: string
  }
}

export default function PrimerIngresoPage() {
  const router = useRouter()
  const { setUser } = useAuth()

  const [context, setContext] = useState<FirstAccessContext | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptDataPolicy, setAcceptDataPolicy] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("first_access_context")
    if (!raw) {
      router.replace("/login")
      return
    }

    try {
      const parsed = JSON.parse(raw) as FirstAccessContext
      if (!parsed?.userId || !parsed?.email || !parsed?.currentPassword) {
        router.replace("/login")
        return
      }
      setContext(parsed)
    } catch {
      router.replace("/login")
    }
  }, [router])

  const legalNotice = useMemo(
    () =>
      context?.legalNotice ?? {
        title: "Tratamiento de datos personales (Ley 1581 de 2012)",
        summary:
          "El tratamiento de datos personales en sitios web en Colombia está regulado por la Ley 1581 de 2012. Debes autorizar de forma previa y expresa la recolección, conocer la finalidad del uso, y contar con mecanismos para acceder, actualizar, rectificar o solicitar eliminación de datos.",
        authority: "Superintendencia de Industria y Comercio (SIC)",
      },
    [context]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!context) {
      toast.error("No se encontró el contexto de primer ingreso")
      return
    }

    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("La confirmación de contraseña no coincide")
      return
    }

    if (!acceptDataPolicy) {
      toast.error("Debes aceptar el tratamiento de datos personales para continuar")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: context.userId,
          currentPassword: context.currentPassword,
          newPassword,
          acceptDataPolicy,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo completar el primer ingreso")
        return
      }

      if (data?.user) {
        setUser(data.user)
      }

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("first_access_context")
      }

      toast.success("Primer ingreso completado. Contraseña actualizada correctamente.")
      router.replace("/dashboard")
    } catch {
      toast.error("Error de red completando primer ingreso")
    } finally {
      setSubmitting(false)
    }
  }

  if (!context) {
    return null
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Primer ingreso de empleado</CardTitle>
            <CardDescription>
              Debes cambiar tu contraseña temporal y aceptar el tratamiento de datos personales para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="rounded-md border p-4 text-sm">
                <p className="font-semibold">{legalNotice.title}</p>
                <p className="mt-2 text-muted-foreground">{legalNotice.summary}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Autorización previa y expresa del titular.</li>
                  <li>Finalidad clara para uso de la información.</li>
                  <li>Derechos de acceso, actualización, rectificación y eliminación.</li>
                  <li>Política de privacidad visible en el sitio web.</li>
                  <li>Protección especial de datos sensibles.</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">Autoridad: {legalNotice.authority}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="email">Correo de acceso</Label>
                  <Input id="email" value={context.email} disabled />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md border p-3">
                <Checkbox
                  id="acceptDataPolicy"
                  checked={acceptDataPolicy}
                  onCheckedChange={(v) => setAcceptDataPolicy(v === true)}
                />
                <Label htmlFor="acceptDataPolicy" className="text-sm leading-normal">
                  Autorizo de manera previa, expresa e informada el tratamiento de mis datos personales conforme a la
                  Ley 1581 de 2012 y la política de privacidad de la empresa.
                </Label>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Finalizar primer ingreso"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
