// app/signup/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button' // Assuming Shadcn/ui
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { signUpUser } from '@/lib/api'; // Import the API function

export default function SignUpPage() {
  // --- State Variables ---
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState(''); // Single field for email/phone
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Hooks ---
  const router = useRouter();

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Client-Side Validation ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!identifier.trim()) {
        setError("Email or Phone Number cannot be empty.");
        return;
    }

    // --- Start API Call ---
    setIsLoading(true);

    try {
      const userData = { name, identifier, password };
      const result = await signUpUser(userData); // Call API function

      // --- Handle Success ---
      console.log('Sign up successful:', result);
      setSuccess('Account created successfully! Redirecting to sign in...');
      setName('');
      setIdentifier('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
           router.push('/signin'); // Redirect on success
      }, 2500);

    } catch (err: any) {
      // --- Handle Error ---
      console.error('Sign up failed:', err);
      // Display the error message from the API (rethrown by lib/api.ts)
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      // --- End API Call ---
      setIsLoading(false);
    }
  };

  // --- Render JSX ---
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-card p-6 md:p-8 rounded-lg shadow-md"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>

        {/* Error Alert */}
        {error && ( <Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertTitle>Sign Up Failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
        {/* Success Alert */}
        {success && (<Alert variant="success" className="mb-6 bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"><CheckCircle className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>)}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your Full Name" disabled={isLoading || !!success} />
          </div>

          {/* Combined Identifier Field */}
          <div>
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <Input id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="you@example.com or 123-456-7890" disabled={isLoading || !!success} />
             <p className="text-xs text-muted-foreground mt-1">We'll use this to sign you in.</p>
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minimum 6 characters" disabled={isLoading || !!success} />
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Re-enter your password" disabled={isLoading || !!success} />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading || !!success}>
             {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        {/* Link to Sign In */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
}