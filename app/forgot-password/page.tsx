'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertCircle, 
  CheckCircle, 
  Mail, 
  Phone, 
  KeyRound,
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  RefreshCw,
  Send,
  Loader2,
  Star,
  MessageCircle,
  Smartphone,
  AtSign
} from 'lucide-react'
// import { forgotPassword } from '@/lib/api' // تأكد من تعديل المسار إذا لزم الأمر

// Floating decoration component
const FloatingElement = ({ delay = 0, children, className = '' }) => (
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
const SuccessAnimation = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute inset-0 pointer-events-none"
  >
    {[...Array(6)].map((_, i) => (
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
        <Mail className="w-4 h-4 text-blue-400 fill-blue-400" />
      </motion.div>
    ))}
  </motion.div>
)

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex justify-center mb-8">
    <div className="flex gap-2">
      {[...Array(totalSteps)].map((_, index) => (
        <motion.div
          key={index}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index < currentStep 
              ? 'bg-blue-500' 
              : index === currentStep 
              ? 'bg-blue-300' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
          animate={{ scale: index === currentStep ? 1.2 : 1 }}
        />
      ))}
    </div>
  </div>
)

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [countdown, setCountdown] = useState(0)
  
  const router = useRouter()

  // Real-time validation
  useEffect(() => {
    const errors = {}
    
    if (touchedFields.identifier && !identifier.trim()) {
      errors.identifier = 'البريد الإلكتروني أو رقم الهاتف مطلوب'
    } else if (touchedFields.identifier && identifier.trim()) {
      const isEmail = identifier.includes('@')
      const isPhone = /^[0-9]{10,}$/.test(identifier.replace(/\s/g, ''))
      
      if (!isEmail && !isPhone) {
        errors.identifier = 'يرجى إدخال بريد إلكتروني صحيح أو رقم هاتف صحيح'
      }
    }
    
    setFieldErrors(errors)
  }, [identifier, touchedFields])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleFieldTouch = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setError('')
    setSuccess('')

    // Mark field as touched for validation
    setTouchedFields({ identifier: true })

    // Validation checks
    if (!identifier.trim()) {
      setError('البريد الإلكتروني أو رقم الهاتف مطلوب.')
      return
    }

    const isEmail = identifier.includes('@')
    const isPhone = /^[0-9]{10,}$/.test(identifier.replace(/\s/g, ''))
    
    if (!isEmail && !isPhone) {
      setError('يرجى إدخال بريد إلكتروني صحيح أو رقم هاتف صحيح.')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call - replace with actual forgotPassword API call
      // const result = await forgotPassword({ identifier })
      
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const method = isEmail ? 'البريد الإلكتروني' : 'رسالة نصية'
      const destination = isEmail ? identifier : `***${identifier.slice(-4)}`
      
      setSuccess(`تم إرسال رابط إعادة تعيين كلمة المرور عبر ${method} إلى ${destination}`)
      setCurrentStep(1)
      setCountdown(60) // Start 60 second countdown for resend
      
    } catch (err) {
      console.error('فشل إرسال رابط إعادة التعيين:', err)
      setError(err.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    
    setCountdown(60)
    setIsLoading(true)
    
    try {
      // Simulate API call for resend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const method = identifier.includes('@') ? 'البريد الإلكتروني' : 'رسالة نصية'
      setSuccess(`تم إعادة إرسال الرابط عبر ${method} بنجاح`)
    } catch (err) {
      setError('فشل في إعادة الإرسال. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900 dark:to-red-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200/30 dark:bg-orange-800/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-200/30 dark:bg-red-800/20 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/20 dark:bg-yellow-800/10 rounded-full filter blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <FloatingElement delay={0} className="top-20 left-20">
        <Sparkles className="w-6 h-6 text-orange-400/60" />
      </FloatingElement>
      <FloatingElement delay={1} className="top-32 right-32">
        <div className="w-3 h-3 bg-red-400/60 rounded-full" />
      </FloatingElement>
      <FloatingElement delay={2} className="bottom-40 left-40">
        <MessageCircle className="w-5 h-5 text-yellow-400/60" />
      </FloatingElement>

      <div className="relative container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          {/* Back to Login Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Link 
              href="/signin"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              العودة لتسجيل الدخول
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl shadow-xl mb-6">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {currentStep === 0 ? 'نسيت كلمة المرور؟' : 'تحقق من بريدك'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStep === 0 
                ? 'لا تقلق، سنساعدك في استعادة حسابك'
                : 'تابع الرابط المرسل لإعادة تعيين كلمة المرور'
              }
            </p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <StepIndicator currentStep={currentStep} totalSteps={2} />
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden"
          >
            {success && currentStep === 1 && <SuccessAnimation />}

            {/* Trust indicators */}
            <div className="flex justify-center gap-6 mb-6">
              {[
                { icon: Shield, label: 'آمن ومحمي' },
                { icon: Clock, label: 'سريع وفوري' },
                { icon: RefreshCw, label: 'سهل الاستعادة' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
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
                    <AlertTitle>حدث خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Alert */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="mb-6"
                >
                  <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="text-green-800 dark:text-green-200">تم الإرسال بنجاح</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 0: Email/Phone Input */}
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Email/Phone Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
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
                        disabled={isLoading}
                        className={`pr-10 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 ${
                          fieldErrors.identifier ? 'border-red-500 focus:ring-red-500/20' : ''
                        }`}
                      />
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

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      disabled={isLoading || !!fieldErrors.identifier}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          جاري الإرسال...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          إرسال رابط الاستعادة
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  {/* Help Text */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                          كيف تعمل عملية الاستعادة؟
                        </h4>
                        <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                          <p>• أدخل بريدك الإلكتروني أو رقم هاتفك المسجل</p>
                          <p>• ستتلقى رابط إعادة تعيين آمن</p>
                          <p>• اتبع الرابط لإنشاء كلمة مرور جديدة</p>
                          <p>• سجل دخولك بكلمة المرور الجديدة</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 1: Success Message */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="flex justify-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                      {identifier.includes('@') ? (
                        <AtSign className="w-10 h-10 text-white" />
                      ) : (
                        <Smartphone className="w-10 h-10 text-white" />
                      )}
                    </div>
                  </motion.div>

                  {/* Instructions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      تحقق من {identifier.includes('@') ? 'بريدك الإلكتروني' : 'رسائلك النصية'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى:
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-xl py-2 px-4 text-sm">
                      {identifier.includes('@') ? identifier : `***${identifier.slice(-4)}`}
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    {/* Resend Button */}
                    <Button
                      onClick={handleResend}
                      variant="outline"
                      className="w-full h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-2xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                      disabled={countdown > 0 || isLoading}
                    >
                      {countdown > 0 ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          إعادة الإرسال خلال {countdown} ثانية
                        </div>
                      ) : isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          إعادة الإرسال
                        </div>
                      )}
                    </Button>

                    {/* Back to Login */}
                    <Button
                      onClick={() => router.push('/signin')}
                      className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        العودة لتسجيل الدخول
                      </div>
                    </Button>
                  </motion.div>

                  {/* Help Tips */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800 text-left"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        نصائح مفيدة
                      </h4>
                      <div className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                        <p>• تحقق من صندوق الرسائل المحذوفة أو الاسبام</p>
                        <p>• قد يستغرق وصول الرسالة بضع دقائق</p>
                        <p>• الرابط صالح لمدة 24 ساعة فقط</p>
                        <p>• تواصل معنا إذا لم تتلق الرسالة خلال 10 دقائق</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-8 text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <Link href="/help" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                مركز المساعدة
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                تواصل معنا
              </Link>
              <span>•</span>
              <Link href="/security" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                الأمان
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}