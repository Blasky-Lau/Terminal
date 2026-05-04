"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield } from "lucide-react"
import { toast } from "sonner"

const roleLabels: Record<string, string> = {
  director: "Director",
  supervisor: "Supervisor",
  empleado: "Empleado",
}

export default function ConfiguracionPage() {
  const { user, setUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    terminalCode: user?.terminalCode ?? "",
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  })

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuracion</h1>
        <p className="text-sm text-muted-foreground">Administra tu perfil y preferencias del sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-2">{user.name}</CardTitle>
            <CardDescription>{user.position}</CardDescription>
            <Badge variant="secondary" className="mt-1">{roleLabels[user.role]}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Correo</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Codigo</span>
              <span className="font-mono text-foreground">{user.terminalCode}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefono</span>
              <span className="text-foreground">{user.phone || "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Settings panels */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Informacion Personal
              </CardTitle>
              <CardDescription>Actualiza tu informacion de contacto</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Nombre completo</Label>
                  <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Correo electronico</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    type="email"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Telefono</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Cargo</Label>
                  <Input defaultValue={user.position || ""} disabled />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Codigo terminal</Label>
                  <Input
                    value={formData.terminalCode}
                    onChange={(e) => setFormData((p) => ({ ...p, terminalCode: e.target.value }))}
                    disabled={user.role !== "director"}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true)
                    try {
                      const res = await fetch("/api/users/me", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: user.id,
                          name: formData.name,
                          email: formData.email,
                          phone: formData.phone,
                          terminalCode: formData.terminalCode,
                        }),
                      })
                      const data = await res.json()
                      if (!res.ok) {
                        toast.error(data?.error ?? "No se pudo guardar la configuración")
                        return
                      }
                      setUser(data.user)
                      toast.success("Configuración actualizada correctamente")
                    } catch {
                      toast.error("Error de red al guardar")
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                >
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura como recibir alertas</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificaciones por correo</p>
                  <p className="text-xs text-muted-foreground">Recibir alertas de turnos por email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificaciones push</p>
                  <p className="text-xs text-muted-foreground">Alertas en tiempo real en el navegador</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Recordatorios de turno</p>
                  <p className="text-xs text-muted-foreground">Recordar 30 minutos antes del turno</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Seguridad
              </CardTitle>
              <CardDescription>Actualiza tu contrasena</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                Conforme a la Ley 1581 de 2012, el tratamiento de datos personales requiere autorización previa,
                expresa e informada. Al cambiar tu contraseña, mantienes vigente tu aceptación de la política de
                tratamiento de datos personales de la organización.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Contrasena actual</Label>
                  <Input
                    type="password"
                    placeholder="Ingresa tu contrasena actual"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Nueva contrasena</Label>
                  <Input
                    type="password"
                    placeholder="Ingresa nueva contrasena"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  disabled={isChangingPassword}
                  onClick={async () => {
                    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
                      toast.error("Completa los campos de contraseña")
                      return
                    }

                    setIsChangingPassword(true)
                    try {
                      const res = await fetch("/api/users/change-password", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: user.id,
                          currentPassword: passwordForm.currentPassword,
                          newPassword: passwordForm.newPassword,
                        }),
                      })

                      const data = await res.json()

                      if (!res.ok) {
                        toast.error(data?.error ?? "No se pudo actualizar la contraseña")
                        return
                      }

                      setPasswordForm({ currentPassword: "", newPassword: "" })
                      toast.success("Contrasena actualizada correctamente")
                    } catch {
                      toast.error("Error de red al actualizar contraseña")
                    } finally {
                      setIsChangingPassword(false)
                    }
                  }}
                >
                  {isChangingPassword ? "Actualizando..." : "Cambiar contrasena"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
