// app/signup/page.tsx
import { Suspense } from 'react'
import SignUpForm from '@/components/SignUpForm'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}