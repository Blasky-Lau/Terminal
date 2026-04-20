"use server"

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function loginAction(formData: FormData, redirectTo: string = '/dashboard') {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.hashedPassword) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  const isValid = await bcrypt.compare(password, user.hashedPassword)

  if (!isValid) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  // Set cookie
  cookies().set('auth-token', user.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 })

  redirect(redirectTo)
}

