// contexts/AuthContext.tsx
'use client';

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
    useCallback,
    useMemo // Import useMemo
} from 'react';
import { Customer, AuthResponse } from '@/types'; // Adjust path
import {
    getCurrentUser,
    signInUser as apiSignIn,
    signOutUser as apiSignOut,
    signUpUser as apiSignUp // Optional: include signup
} from '@/lib/api'; // Adjust path
import { useRouter } from 'next/navigation'; // Use for potential redirects on actions

interface AuthContextType {
    user: Customer | null;
    isLoading: boolean; // Is auth state currently being checked?
    error: string | null; // Store auth-related errors
    isAuthenticated: boolean; // Derived state: user exists and not loading
    signIn: (credentials: { identifier: string, password: string }) => Promise<Customer | null>;
    signOut: () => Promise<void>;
    signUp: (userData: { name: string, identifier: string, password: string }) => Promise<Customer | null>; // Optional
    checkAuthState: () => Promise<void>; // Manually trigger a state check
}

// Create the context with an undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading initially
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    // Function to check authentication status (e.g., on load)
    const checkAuthState = useCallback(async () => {
        // console.log("AuthProvider: Checking auth state...");
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await getCurrentUser(); // Calls GET /api/auth/me
            // console.log("AuthProvider: Fetched user:", currentUser);
            setUser(currentUser);
            console.log("AuthProvider: User state set:", currentUser);
        } catch (err: any) {
            // Should be handled within getCurrentUser, but catch just in case
            console.error("AuthProvider: Error during checkAuthState:", err);
            setUser(null); // Ensure user is null on error
            setError("Failed to check authentication status."); // Set a generic error
        } finally {
            setIsLoading(false);
            // console.log("AuthProvider: Finished checking auth state.");
        }
    }, []); // Empty dependency array means this callback is created once

    // Check auth state when the provider mounts
    useEffect(() => {
        checkAuthState();
    }, [checkAuthState]); // Run checkAuthState on mount


    // Sign In function
    const signIn = useCallback(async (credentials: { identifier: string, password: string }): Promise<Customer | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiSignIn(credentials); // Calls POST /api/auth/signin
            console.log("AuthProvider: Token received:", response);

            if (response.success) {
                setUser(response.data);
                // --- Token Handling (IF NOT using HttpOnly cookies) ---
                if (response.token) {
                    console.log("AuthProvider: Token received:", response);
                    console.log("AuthProvider: Token received:", response.token);

                   localStorage.setItem('authToken', response.token); // Example: Store token
                   // Reset axios default header if needed, or rely on interceptor
                }
                // --- End Token Handling ---
                return response.data; // Return user data on success
            } else {
                 // Should be caught by catch block if API returns non-2xx
                throw new Error(response.message || "Sign in failed");
            }
        } catch (err: any) {
            console.error("AuthProvider: Sign in error:", err);
            setError(err.message || "Sign in failed.");
            setUser(null); // Ensure user is null on failed login
            return null; // Indicate failure
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array

    // Sign Out function
    const signOut = useCallback(async () => {
        setIsLoading(true); // Indicate loading during signout
        setError(null);
        try {
            await apiSignOut(); // Calls POST /api/auth/signout
             // --- Token Handling (IF NOT using HttpOnly cookies) ---
             // localStorage.removeItem('authToken'); // Example: Clear token
             // Reset axios default header if needed
             // --- End Token Handling ---
        } catch (err: any) {
            console.error("AuthProvider: Sign out error:", err);
            // Don't necessarily clear user state if API call fails, backend might still be logged in
            setError(err.message || "Failed to sign out properly.");
            // Optional: Force clear user state anyway? Depends on desired UX.
             // setUser(null);
        } finally {
            setUser(null); // Always clear user state client-side after attempt
            setIsLoading(false);
             // Optional: Redirect after signout? Can be done here or in the component calling signOut
             // router.push('/');
        }
    }, []); // Empty dependency array


    // Sign Up function (Optional)
    const signUp = useCallback(async (userData: { name: string, identifier: string, password: string }): Promise<Customer | null> => {
        setIsLoading(true);
        setError(null);
        try {
            // Sign up doesn't log the user in this flow, just creates the account
            const newUser = await apiSignUp(userData);
            // Don't set user state here
            return newUser;
        } catch (err: any) {
            console.error("AuthProvider: Sign up error:", err);
            setError(err.message || "Sign up failed.");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array

    // Derived state: Is the user authenticated?
    // Ensures we have user data AND we are not in the initial loading phase.
    const isAuthenticated = useMemo(() => !!user && !isLoading, [user, isLoading]);

    // Memoize the context value to prevent unnecessary re-renders
     const value = useMemo(() => ({
        user,
        isLoading,
        error,
        isAuthenticated,
        signIn,
        signOut,
        signUp,
        checkAuthState
    }), [user, isLoading, error, isAuthenticated, signIn, signOut, signUp, checkAuthState]);


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the Auth Context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};