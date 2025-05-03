// Example: components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // Import the hook
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, isAuthenticated, isLoading, signOut, error } = useAuth(); // Use the hook
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        // Optionally redirect after sign out completes
        router.push('/');
        router.refresh(); // Refresh server components if needed
    };

    return (
        <nav className="bg-card border-b p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">MyApp</Link>

                {/* Display loading state */}
                {isLoading && <span>Loading User...</span>}

                {/* Display error state (optional) */}
                {error && <span className='text-destructive text-xs'>Auth Error: {error}</span>}

                {/* Display user info or login/signup buttons */}
                {!isLoading && ( // Only render buttons when not loading initial state
                    <div>
                        {isAuthenticated && user ? (
                            <div className="flex items-center space-x-4">
                                <span>Hi, {user.name}!</span>
                                <Link href="/profile">
                                    <Button variant="ghost" size="sm">Profile</Button>
                                </Link>
                                <Button onClick={handleSignOut} variant="outline" size="sm">
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <div className="space-x-2">
                                <Link href="/signin">
                                    <Button variant="outline" size="sm">Sign In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button variant="default" size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}