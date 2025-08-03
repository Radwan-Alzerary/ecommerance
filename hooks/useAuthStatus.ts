'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export const useAuthStatus = () => {
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      setIsAuthenticated(true)
      setUser(session.user)
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [session, status])

  return {
    isAuthenticated,
    user,
    isLoading: status === 'loading',
    session
  }
}
