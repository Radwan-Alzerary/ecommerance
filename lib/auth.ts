// lib/auth.ts
import { signIn, getSession } from 'next-auth/react'
import { api } from './api' // استيراد axios instance

export const signInWithGoogle = async (opts?: { callbackUrl?: string }) => {
  try {
    const result = await signIn('google', {
      callbackUrl: opts?.callbackUrl ?? '/',
      redirect: true,
    })
    return result
  } catch (error) {
    console.error('Google sign in error:', error)
    throw error
  }
}

export const signInWithFacebook = async (opts?: { callbackUrl?: string }) => {
  try {
    const result = await signIn('facebook', {
      callbackUrl: opts?.callbackUrl ?? '/',
      redirect: true,
    })
    return result
  } catch (error) {
    console.error('Facebook sign in error:', error)
    throw error
  }
}

// دالة لحفظ بيانات OAuth في السيرفر
export const saveOAuthUserToServer = async (provider: 'google' | 'facebook', user: any) => {
  try {
    const endpoint = provider === 'google' ? '/auth/oauth/google' : '/auth/oauth/facebook'
    
    const payload = {
      [provider === 'google' ? 'googleId' : 'facebookId']: user.id,
      email: user.email,
      name: user.name,
      picture: user.image
    }
    
    const response = await api.post(endpoint, payload)
    
    // حفظ JWT token في localStorage للاستخدام مع API calls
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    
    return response.data
  } catch (error) {
    console.error(`Error saving ${provider} user to server:`, error)
    throw error
  }
}

export const getCurrentSession = async () => {
  try {
    const session = await getSession()
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}
