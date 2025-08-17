"use client"
import { useState, useEffect } from 'react'
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
  CheckCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  User, 
  Lock,
  Sparkles,
  ArrowLeft,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Gift,
  Star
} from 'lucide-react'
import { signUpUser } from '@/lib/api'
import type { CheckedState } from '@radix-ui/react-checkbox'
import React from 'react'

const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 6) score++
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }
  const strength = getStrength(password)
  if (!password) return null
  const getColor = () => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-orange-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }
  const labelMap = ['ضعيف', 'متوسط', 'جيد', 'قوي', 'ممتاز']
  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600 dark:text-gray-400">قوة كلمة المرور:</span>
        <span className="text-xs font-medium">
          {labelMap[Math.min(strength - 1, 4)]}
        </span>
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? getColor() : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
    </div>
  )
}

const FloatingElement = ({ delay = 0, children, className = '' }: { delay?: number; children: React.ReactNode; className?: string }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0], y: [0, -20, -40, -60], x: [0, 10, -10, 0] }}
    transition={{ duration: 4, delay, repeat: Infinity, repeatDelay: 3 }}
  >{children}</motion.div>
)

const SuccessCelebration = () => (
  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div key={i} className="absolute" initial={{ x: '50%', y: '50%', scale: 0 }} animate={{ x: `${50 + (Math.random() - 0.5) * 200}%`, y: `${50 + (Math.random() - 0.5) * 200}%`, scale: [0, 1, 0], rotate: [0, 360] }} transition={{ duration: 2, delay: i * 0.1, ease: 'easeOut' }}>
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      </motion.div>
    ))}
  </motion.div>
)

export function SignUpForm() {
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; identifier?: string; password?: string; confirmPassword?: string }>({})
  const [touchedFields, setTouchedFields] = useState<{ name?: boolean; identifier?: boolean; password?: boolean; confirmPassword?: boolean }>({})

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errors: { name?: string; identifier?: string; password?: string; confirmPassword?: string } = {}
    if (touchedFields.name && !name.trim()) errors.name = 'الاسم مطلوب'
    if (touchedFields.identifier && !identifier.trim()) errors.identifier = 'البريد الإلكتروني أو رقم الهاتف مطلوب'
    if (touchedFields.password && password.length < 6) errors.password = 'يجب ألا تقل كلمة المرور عن 6 أحرف'
    if (touchedFields.confirmPassword && password !== confirmPassword) errors.confirmPassword = 'كلمات المرور غير متطابقة'
    setFieldErrors(errors)
  }, [name, identifier, password, confirmPassword, touchedFields])

  const handleFieldTouch = (field: 'name' | 'identifier' | 'password' | 'confirmPassword') => setTouchedFields(prev => ({ ...prev, [field]: true }))

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e?.preventDefault) e.preventDefault()
    setError(''); setSuccess('')
    setTouchedFields({ name: true, identifier: true, password: true, confirmPassword: true })
    if (!name.trim()) return setError('الاسم الكامل مطلوب.')
    if (!identifier.trim()) return setError('حقل البريد الإلكتروني أو رقم الهاتف لا يمكن أن يكون فارغاً.')
    if (password.length < 6) return setError('يجب ألا تقل كلمة المرور عن 6 أحرف.')
    if (password !== confirmPassword) return setError('كلمات المرور غير متطابقة.')
    if (!acceptTerms) return setError('يجب الموافقة على الشروط والأحكام.')
    setIsLoading(true)
    try {
      const result = await signUpUser({ name, identifier, password })
      console.log('تم إنشاء الحساب بنجاح:', result)
      setSuccess('تم إنشاء الحساب بنجاح! مرحباً بك في عائلة Oro Eshop')
      setName(''); setIdentifier(''); setPassword(''); setConfirmPassword(''); setAcceptTerms(false); setTouchedFields({})
      setTimeout(() => {
        const redirectPath = searchParams.get('redirect')
        router.push(redirectPath ? `/signin?redirect=${redirectPath}` : '/signin')
      }, 3000)
    } catch (err) {
      console.error('فشل إنشاء الحساب:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-800/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-800/20 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/20 dark:bg-pink-800/10 rounded-full filter blur-3xl" />
      </div>
      <FloatingElement delay={0} className="top-20 left-20"><Sparkles className="w-6 h-6 text-blue-400/60" /></FloatingElement>
      <FloatingElement delay={1} className="top-32 right-32"><div className="w-3 h-3 bg-purple-400/60 rounded-full" /></FloatingElement>
      <FloatingElement delay={2} className="bottom-40 left-40"><Gift className="w-5 h-5 text-pink-400/60" /></FloatingElement>
      <div className="relative container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">إنشاء حساب جديد</h1>
            <p className="text-gray-600 dark:text-gray-400">انضم إلينا واكتشف عالم التسوق الممتع</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden">
            {success && <SuccessCelebration />}
            <div className="flex justify-center gap-6 mb-6">
              {[
                { icon: Shield, label: 'آمن ومحمي' },
                { icon: Zap, label: 'سريع وسهل' },
                { icon: Gift, label: 'عروض حصرية' }
              ].map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + index * 0.1 }} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="mb-6">
                  <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>فشل التسجيل</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="mb-6">
                  <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="text-green-800 dark:text-green-200">تم بنجاح</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} onBlur={() => handleFieldTouch('name')} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} placeholder="أدخل اسمك الكامل" disabled={isLoading || !!success} className={`pr-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${fieldErrors.name ? 'border-red-500 focus:ring-red-500/20' : ''}`}/>
                  {fieldErrors.name && <div className="absolute left-3 top-1/2 -translate-y-1/2"><XCircle className="h-5 w-5 text-red-500" /></div>}
                </div>
                {fieldErrors.name && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.name}</motion.p>}
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <Label htmlFor="identifier" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">البريد الإلكتروني أو رقم الهاتف</Label>
                <div className="relative">
                  {identifier.includes('@') ? <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> : <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
                  <Input id="identifier" type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} onBlur={() => handleFieldTouch('identifier')} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} placeholder="email@example.com أو 0770000000" disabled={isLoading || !!success} className={`pr-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${fieldErrors.identifier ? 'border-red-500 focus:ring-red-500/20' : ''}`}/>
                  {fieldErrors.identifier && <div className="absolute left-3 top-1/2 -translate-y-1/2"><XCircle className="h-5 w-5 text-red-500" /></div>}
                </div>
                {fieldErrors.identifier && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.identifier}</motion.p>}
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onBlur={() => handleFieldTouch('password')} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} placeholder="لا تقل عن 6 أحرف" disabled={isLoading || !!success} className={`px-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/20' : ''}`}/>
                  <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-transparent" onClick={() => setShowPassword(p => !p)}>{showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}</Button>
                </div>
                <PasswordStrength password={password} />
                {fieldErrors.password && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.password}</motion.p>}
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onBlur={() => handleFieldTouch('confirmPassword')} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} placeholder="أعد إدخال كلمة المرور" disabled={isLoading || !!success} className={`px-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}/>
                  <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-transparent" onClick={() => setShowConfirmPassword(p => !p)}>{showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}</Button>
                  {password && confirmPassword && password === confirmPassword && <div className="absolute left-12 top-1/2 -translate-y-1/2"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>}
                </div>
                {fieldErrors.confirmPassword && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 dark:text-red-400 text-sm mt-1">{fieldErrors.confirmPassword}</motion.p>}
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="flex items-start gap-3">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked: CheckedState) => setAcceptTerms(checked === true)} disabled={isLoading || !!success} className="mt-1 rounded-md" />
                <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer">أوافق على{' '}<Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">الشروط والأحكام</Link>{' '}و{' '}<Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">سياسة الخصوصية</Link></Label>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
                <Button onClick={handleSubmit} className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50" disabled={isLoading || !!success || !acceptTerms}>
                  {isLoading ? (<div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />جارٍ إنشاء الحساب...</div>) : success ? (<div className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />تم إنشاء الحساب</div>) : (<div className="flex items-center gap-2"><User className="h-5 w-5" />إنشاء حساب</div>)}
                </Button>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">لديك حساب بالفعل؟{' '}<Link href="/signin" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"><ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />تسجيل الدخول</Link></p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
export default SignUpForm
