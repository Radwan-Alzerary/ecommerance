'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthContextProvider loginPath="/signin" loadingComponent={<div>Loading...</div>}>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  )
}
