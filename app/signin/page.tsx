'use client'

import { useState, useEffect, Suspense } from 'react'
import type { CheckedState } from '@radix-ui/react-checkbox'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Lock,
  LogIn,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Gift,
  Star,
  UserCheck,
  KeyRound
} from 'lucide-react'
import { signInUser } from '@/lib/api'
import { signInWithGoogle, signInWithFacebook } from '@/lib/auth'

// Floating decoration component
const FloatingElement = ({ delay = 0, children, className = '' }: { delay?: number; children: React.ReactNode; className?: string }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [0, -20, -40, -60],
      x: [0, 10, -10, 0]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: 3
    }}
  >
    {children}
  </motion.div>
)

// Success animation component
const LoginSuccessAnimation = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute inset-0 pointer-events-none"
  >
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{ 
          x: '50%', 
          y: '50%',
          scale: 0
        }}
        animate={{ 
          x: `${50 + (Math.random() - 0.5) * 200}%`,
          y: `${50 + (Math.random() - 0.5) * 200}%`,
          scale: [0, 1, 0],
          rotate: [0, 360]
        }}
        transition={{
          duration: 2,
          delay: i * 0.1,
          ease: "easeOut"
        }}
      >
        <CheckCircle className="w-4 h-4 text-green-400 fill-green-400" />
      </motion.div>
    ))}
  </motion.div>
)

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({})
  const [touchedFields, setTouchedFields] = useState<{ identifier?: boolean; password?: boolean }>({})
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Real-time validation
  useEffect(() => {
    const errors: { identifier?: string; password?: string } = {}
    
    if (touchedFields.identifier && !identifier.trim()) {
      errors.identifier = 'البريد الإلكتروني أو رقم الهاتف مطلوب'
    }
    
    if (touchedFields.password && password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    
    setFieldErrors(errors)
  }, [identifier, password, touchedFields])

  const handleFieldTouch = (field: 'identifier' | 'password') => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: any) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setError('')

    // Mark all fields as touched for validation
    setTouchedFields({
      identifier: true,
      password: true
    })

    // Validation checks
    if (!identifier.trim()) {
      setError('البريد الإلكتروني أو رقم الهاتف مطلوب.')
      return
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.')
      return
    }

    setIsLoading(true)

    try {
      const user = await signInUser({ identifier, password })
      console.log('تم تسجيل الدخول بنجاح:', user)
      
      // حفظ حالة تسجيل الدخول
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('authProvider', 'local')
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }
      
      // إطلاق حدث مخصص لتحديث جميع المكونات
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }))
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'isAuthenticated',
        newValue: 'true',
        url: window.location.href
      }))
      
      setIsSuccess(true)

      setTimeout(() => {
        const redirectPath = searchParams.get('redirect') || '/'
        router.push(redirectPath)
      }, 1500)

    } catch (err: any) {
      console.error('فشل تسجيل الدخول:', err)
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      const result = await signInWithGoogle()
      
      // في حالة NextAuth، result?.ok يعني نجاح المصادقة
      if (result?.ok || result?.url) {
        // حفظ حالة تسجيل الدخول
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('authProvider', 'google')
        
        // إطلاق حدث مخصص لتحديث جميع المكونات
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { provider: 'google' } }))
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'isAuthenticated',
          newValue: 'true',
          url: window.location.href
        }))
        
        setIsSuccess(true)
        
        setTimeout(() => {
          const redirectPath = searchParams.get('redirect') || '/'
          router.push(redirectPath)
        }, 1500)
      } else if (result?.error) {
        setError('فشل تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.')
      }
    } catch (error: any) {
      console.error('Google sign in failed:', error)
      setError(error.message || 'فشل تسجيل الدخول عبر Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      const result = await signInWithFacebook()
      
      if (result?.ok || result?.url) {
        // حفظ حالة تسجيل الدخول
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('authProvider', 'facebook')
        
        // إطلاق حدث مخصص لتحديث جميع المكونات
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { provider: 'facebook' } }))
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'isAuthenticated',
          newValue: 'true',
          url: window.location.href
        }))
        
        setIsSuccess(true)
        
        setTimeout(() => {
          const redirectPath = searchParams.get('redirect') || '/'
          router.push(redirectPath)
        }, 1500)
      } else if (result?.error) {
        setError('فشل تسجيل الدخول عبر Facebook. يرجى المحاولة مرة أخرى.')
      }
    } catch (error: any) {
      console.error('Facebook sign in failed:', error)
      setError(error.message || 'فشل تسجيل الدخول عبر Facebook')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-800/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-800/20 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-200/20 dark:bg-green-800/10 rounded-full filter blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <FloatingElement delay={0} className="top-20 right-20">
        <Sparkles className="w-6 h-6 text-blue-400/60" />
      </FloatingElement>
      <FloatingElement delay={1} className="top-32 left-32">
        <div className="w-3 h-3 bg-purple-400/60 rounded-full" />
      </FloatingElement>
      <FloatingElement delay={2} className="bottom-40 right-40">
        <UserCheck className="w-5 h-5 text-green-400/60" />
      </FloatingElement>

      <div className="relative container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl shadow-xl mb-6">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              مرحباً بعودتك
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              سجل دخولك للمتابعة إلى حسابك
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden"
          >
            {isSuccess && <LoginSuccessAnimation />}

            {/* Trust indicators */}
            <div className="flex justify-center gap-6 mb-6">
              {[
                { icon: Shield, label: 'آمن ومحمي' },
                { icon: Zap, label: 'دخول سريع' },
                { icon: Gift, label: 'عروض خاصة' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="mb-6"
                >
                  <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>فشل تسجيل الدخول</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Alert */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="mb-6"
                >
                  <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="text-green-800 dark:text-green-200">تم بنجاح</AlertTitle>
                    <AlertDescription>تم تسجيل الدخول بنجاح! جاري التوجيه...</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <div className="space-y-6">
              {/* Email/Phone Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="identifier" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  البريد الإلكتروني أو رقم الهاتف
                </Label>
                <div className="relative">
                  {identifier.includes('@') ? (
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  )}
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onBlur={() => handleFieldTouch('identifier')}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="email@example.com أو 0770000000"
                    disabled={isLoading || isSuccess}
                    className={`pr-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500/20 transition-all duration-300 ${
                      fieldErrors.identifier ? 'border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  {fieldErrors.identifier && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {fieldErrors.identifier && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 dark:text-red-400 text-sm mt-1"
                  >
                    {fieldErrors.identifier}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleFieldTouch('password')}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    placeholder="••••••••"
                    disabled={isLoading || isSuccess}
                    className={`px-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500/20 transition-all duration-300 ${
                      fieldErrors.password ? 'border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 dark:text-red-400 text-sm mt-1"
                  >
                    {fieldErrors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked: CheckedState) => setRememberMe(checked === true)}
                    disabled={isLoading || isSuccess}
                    className="rounded-md"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    تذكرني
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  نسيت كلمة المرور؟
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </div>
                  ) : isSuccess ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      تم تسجيل الدخول
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      تسجيل الدخول
                    </div>
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 font-medium">
                    أو
                  </span>
                </div>
              </motion.div>

              {/* Social Login Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  disabled={isLoading || isSuccess}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    الدخول بواسطة Google
                  </div>
                </Button>
                
                <Button
                  onClick={handleFacebookSignIn}
                  variant="outline"
                  className="w-full h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  disabled={isLoading || isSuccess}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">f</span>
                    </div>
                    الدخول بواسطة Facebook
                  </div>
                </Button>
              </motion.div>

              {/* Quick Demo Login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">تجربة سريعة</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                  جرب الموقع بحساب تجريبي
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIdentifier('demo@oro-eshop.com')
                    setPassword('demo123')
                  }}
                  className="w-full text-blue-600 border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl"
                  disabled={isLoading || isSuccess}
                >
                  استخدام الحساب التجريبي
                </Button>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-center space-y-3"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ليس لديك حساب؟{' '}
                <Link 
                  href="/signup" 
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
                >
                  إنشاء حساب جديد
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
              
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  الشروط والأحكام
                </Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  سياسة الخصوصية
                </Link>
                <span>•</span>
                <Link href="/help" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  المساعدة
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
    </Suspense>
  )
}