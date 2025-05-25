// app/signin/layout.tsx
'use client'

import { Suspense } from 'react'

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      {children}
    </Suspense>
  )
}
