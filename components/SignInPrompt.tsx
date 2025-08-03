'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, LogIn, UserPlus } from 'lucide-react'

export default function SignInPrompt() {
  const router = useRouter()
  const pathname = usePathname()

  // Create redirect URL for current page
  const redirectUrl = encodeURIComponent(pathname)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-lg mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          تسجيل الدخول مطلوب
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          يرجى تسجيل الدخول للمتابعة إلى صفحة الدفع
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={() => router.push(`/signin?redirect=${redirectUrl}`)}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <LogIn className="w-5 h-5 mr-2" />
          تسجيل الدخول
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => router.push(`/signup?redirect=${redirectUrl}`)}
          className="w-full h-12 rounded-xl font-medium border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          إنشاء حساب جديد
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          بتسجيل الدخول، فإنك توافق على{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">
            الشروط والأحكام
          </Link>
          {' '}و{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            سياسة الخصوصية
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

