// app/signup/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { signUpUser } from '@/lib/api'

export default function SignUpPage() {
  // --- متغيرات الحالة ---
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // --- هوك التنقل ---
  const router = useRouter()

  // --- دالة إرسال النموذج ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة.')
      return
    }
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف.')
      return
    }
    // التحقق من حقل البريد أو الهاتف
    if (!identifier.trim()) {
      setError('حقل البريد الإلكتروني أو رقم الهاتف لا يمكن أن يكون فارغاً.')
      return
    }

    setIsLoading(true)

    try {
      const userData = { name, identifier, password }
      const result = await signUpUser(userData)

      console.log('تم إنشاء الحساب بنجاح:', result)
      setSuccess('تم إنشاء الحساب بنجاح! سيتم الانتقال إلى صفحة تسجيل الدخول...')
      setName('')
      setIdentifier('')
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        router.push('/signin')
      }, 2500)
    } catch (err: any) {
      console.error('فشل إنشاء الحساب:', err)
      setError(err.message || 'حدث خطأ غير متوقع.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-card p-6 md:p-8 rounded-lg shadow-md"
      >
        <h1 className="text-3xl font-bold text-center mb-8">إنشاء حساب</h1>

        {/* عرض الأخطاء */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>فشل التسجيل</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* عرض النجاح */}
        {success && (
          <Alert variant="success" className="mb-6 bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>تم بنجاح</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* نموذج التسجيل */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* حقل الاسم الكامل */}
          <div>
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="أدخل اسمك الكامل"
              disabled={isLoading || !!success}
            />
          </div>

          {/* حقل البريد أو الهاتف */}
          <div>
            <Label htmlFor="identifier">البريد الإلكتروني أو رقم الهاتف</Label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              placeholder="0770000000 ,email@gmail.com"
              disabled={isLoading || !!success}
            />
          </div>

          {/* حقل كلمة المرور */}
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="لا تقل عن 6 أحرف"
              disabled={isLoading || !!success}
            />
          </div>

          {/* حقل تأكيد كلمة المرور */}
          <div>
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="أعد إدخال كلمة المرور"
              disabled={isLoading || !!success}
            />
          </div>

          {/* زر الإرسال */}
          <Button type="submit" className="w-full" disabled={isLoading || !!success}>
            {isLoading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
          </Button>
        </form>

        {/* رابط تسجيل الدخول */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
