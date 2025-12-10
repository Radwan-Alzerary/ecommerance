'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentUser } from '@/lib/api'

export const useAuthStatus = () => {
  const { data: session, status } = useSession()
  const authContext = useAuth()
  const { user: authUser, isAuthenticated: authContextAuthenticated, isLoading: authContextLoading } = authContext
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)

  // التحقق من localStorage مباشرة كنسخة احتياطية
  const checkLocalAuth = async () => {
    if (typeof window !== 'undefined') {
      const isAuthenticatedLocal = localStorage.getItem('isAuthenticated') === 'true'
      if (isAuthenticatedLocal) {
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) {
            setIsAuthenticated(true)
            setUser(currentUser)
            return true
          }
        } catch (error) {
          console.error('Error checking local auth:', error)
        }
      }
    }
    return false
  }

  useEffect(() => {
    const updateAuthState = async () => {
      // التحقق من OAuth (NextAuth) أولاً
      if (status === 'authenticated' && session) {
        setIsAuthenticated(true)
        setUser(session.user)
      } 
      // ثم التحقق من تسجيل الدخول العادي عبر AuthContext
      else if (authContextAuthenticated && authUser) {
        setIsAuthenticated(true)
        setUser(authUser)
      }
      // التحقق من localStorage كنسخة احتياطية
      else {
        const hasLocalAuth = await checkLocalAuth()
        if (!hasLocalAuth) {
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    }
    
    updateAuthState()
  }, [session, status, authUser, authContextAuthenticated, forceUpdate])

  // الاستماع لتغييرات حالة المصادقة
  useEffect(() => {
    const handleAuthChange = () => {
      setForceUpdate(prev => prev + 1)
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated' || e.key === 'authToken') {
        setForceUpdate(prev => prev + 1)
      }
    }
    
    window.addEventListener('authStateChanged', handleAuthChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return {
    isAuthenticated,
    user,
    isLoading: status === 'loading' || authContextLoading,
    session
  }
}
