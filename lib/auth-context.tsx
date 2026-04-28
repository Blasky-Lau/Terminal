"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/types"

type FirstAccessPayload = {
  userId: string
  email: string
  legalNotice?: {
    title: string
    summary: string
    authority: string
  }
}

type LoginResult =
  | { ok: true; requiresPasswordChange: false }
  | { ok: true; requiresPasswordChange: true; firstAccess: FirstAccessPayload }
  | { ok: false }

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "terminal_auth_user"

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as User
    }
  } catch {
    // ignore
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const persistUser = useCallback((u: User | null) => {
    setUser(u)
    if (u) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) return { ok: false }

      const data = await res.json()

      if (data?.requiresPasswordChange && data?.firstAccess?.userId && data?.firstAccess?.email) {
        return {
          ok: true,
          requiresPasswordChange: true,
          firstAccess: data.firstAccess as FirstAccessPayload,
        }
      }

      if (!data?.user) return { ok: false }

      persistUser(data.user as User)
      return { ok: true, requiresPasswordChange: false }
    } catch {
      return { ok: false }
    }
  }, [persistUser])

  const logout = useCallback(() => {
    persistUser(null)
  }, [persistUser])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setUser: persistUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
