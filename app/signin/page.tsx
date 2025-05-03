'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { signInUser } from '@/lib/api'; // Adjust path as needed

export default function SignInPage() {
  // Use 'identifier' state instead of 'email'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true);

    try {
      // Pass 'identifier' to the API call
      const user = await signInUser({ identifier, password });
      console.log('Sign in successful:', user);

      const redirectPath = searchParams.get('redirect') || '/checkout';
      router.push(redirectPath);

    } catch (err: any) {
      console.error('Sign in failed:', err);
      // Use a more general error message if needed, as API message might mention 'credentials'
      setError(err.message || 'Sign in failed. Please check your details.');
    } finally {
        setIsLoading(false);
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
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sign In Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* Update Label */}
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <Input
              // Update id, value, onChange, placeholder
              id="identifier"
              type="text" // Use text type to allow both email and phone format
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="you@example.com or 1234567890"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
         <p className="mt-2 text-center text-sm">
           <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
             Forgot password?
           </Link>
         </p>
      </motion.div>
    </div>
  )
}