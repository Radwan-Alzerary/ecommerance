import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import axios from 'axios'
import { getApiUrl } from '@/lib/apiUrl'

export const authOptions = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        // حفظ بيانات المستخدم في السيرفر عند تسجيل الدخول
        if (account?.provider === 'google' || account?.provider === 'facebook') {
          const baseURL = await getApiUrl()
          const endpoint = account.provider === 'google' ? '/auth/oauth/google' : '/auth/oauth/facebook'
          
          const payload = {
            [account.provider === 'google' ? 'googleId' : 'facebookId']: account.providerAccountId,
            email: user.email,
            name: user.name,
            picture: user.image,
            accessToken: account.access_token
          }
          
          const response = await axios.post(`${baseURL}${endpoint}`, payload)
          
          // حفظ JWT token
          if (response.data.success && response.data.token) {
            user.backendToken = response.data.token
          }
        }
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        // السماح بالدخول حتى لو فشل حفظ البيانات في السيرفر
        return true
      }
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub
        session.user.backendToken = token.backendToken
      }
      return session
    },
    async jwt({ user, token, account }: any) {
      if (user) {
        token.uid = user.id
        token.backendToken = user.backendToken
      }
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
