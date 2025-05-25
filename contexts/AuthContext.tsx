// contexts/AuthContext.tsx
'use client';

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
    useCallback,
    useMemo
} from 'react';
import { Customer, AuthResponse } from '@/types'; // Adjust path
import {
    getCurrentUser,
    signInUser as apiSignIn,
    signOutUser as apiSignOut,
    signUpUser as apiSignUp
} from '@/lib/api'; // Adjust path
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname

interface AuthContextType {
    user: Customer | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    signIn: (credentials: { identifier: string, password: string }) => Promise<Customer | null>;
    signOut: () => Promise<void>;
    signUp: (userData: { name: string, identifier: string, password: string }) => Promise<Customer | null>;
    checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
    /**
     * The path to redirect to for login. Defaults to '/login'.
     * Ensure this page is NOT itself a child of AuthProvider to avoid redirect loops.
     */
    loginPath?: string;
    /**
     * Optional: A component to display while authentication is loading.
     */
    loadingComponent?: ReactNode;
}

export const AuthProvider = ({
    children,
    loginPath = '/login', // Default login path
    loadingComponent = <div>Loading authentication...</div> // Default loading UI
}: AuthProviderProps) => {
    const [user, setUser] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname(); // Get current path

    const checkAuthState = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            // console.log("AuthProvider: User state set:", currentUser);
        } catch (err: any) {
            console.error("AuthProvider: Error during checkAuthState:", err);
            setUser(null);
            setError("Failed to check authentication status.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthState();
    }, [checkAuthState]);

    const signIn = useCallback(async (credentials: { identifier: string, password: string }): Promise<Customer | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiSignIn(credentials);
            if (response.success) {
                setUser(response.data);
                if (response.token) {
                    // console.log("AuthProvider: Token received:", response.token);
                    // localStorage.setItem('authToken', response.token); // Only if not using HttpOnly cookies
                }
                return response.data;
            } else {
                throw new Error(response.message || "Sign in failed");
            }
        } catch (err: any) {
            console.error("AuthProvider: Sign in error:", err);
            setError(err.message || "Sign in failed.");
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await apiSignOut();
            // localStorage.removeItem('authToken'); // Only if not using HttpOnly cookies
        } catch (err: any) {
            console.error("AuthProvider: Sign out error:", err);
            setError(err.message || "Failed to sign out properly.");
        } finally {
            setUser(null);
            setIsLoading(false);
            // Redirect to login or home after sign out
            if (pathname !== loginPath) { // Avoid redirecting if already on login page after a failed auth check
                router.push(loginPath); // Or router.push('/') for home page
            }
        }
    }, [router, loginPath, pathname]); // Added router and loginPath to dependencies

    const signUp = useCallback(async (userData: { name: string, identifier: string, password: string }): Promise<Customer | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const newUser = await apiSignUp(userData);
            return newUser;
        } catch (err: any) {
            console.error("AuthProvider: Sign up error:", err);
            setError(err.message || "Sign up failed.");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const isAuthenticated = useMemo(() => !!user, [user]); // Simpler: user exists

    // Effect to handle redirection if not authenticated
    useEffect(() => {
        // Don't redirect if:
        // 1. We are still loading the auth state.
        // 2. The user is authenticated.
        // 3. We are already on the login page (to prevent redirect loops if login page is somehow included).
        if (!isLoading && !isAuthenticated && pathname !== loginPath) {
            console.log(`AuthProvider: Not authenticated or loading. Current path: ${pathname}. Redirecting to ${loginPath}`);
            router.push(loginPath);
        }
    }, [isLoading, isAuthenticated, router, loginPath, pathname]);

    const value = useMemo(() => ({
        user,
        isLoading, // Expose actual loading state
        error,
        isAuthenticated, // This will be true only when user is set AND initial loading is done
        signIn,
        signOut,
        signUp,
        checkAuthState
    }), [user, isLoading, error, isAuthenticated, signIn, signOut, signUp, checkAuthState]);

    // Conditional rendering based on auth state
    if (isLoading) {
        return <>{loadingComponent}</>; // Show loading component while checking auth
    }

    // If not authenticated and not on the login page,
    // the useEffect above will trigger a redirect.
    // Render children only if authenticated.
    // If not authenticated, and we are on a protected route,
    // this can render null or a minimal placeholder until redirect takes effect.
    if (!isAuthenticated && pathname !== loginPath) {
        // This content might be briefly visible before the redirect from useEffect kicks in.
        // Or, you can return the loadingComponent again, or null.
        // console.log("AuthProvider: Waiting for redirect, not rendering children.");
        return <>{loadingComponent}</>; // Or null, or a "Redirecting..." message
    }

    // If authenticated, or if on the login page itself (allowing login page to render)
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};