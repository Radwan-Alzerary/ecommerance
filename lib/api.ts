// lib/api.ts (or utils/api.ts etc.)

import axios, { AxiosError } from 'axios'; // Import AxiosError
import {
    Product,
    User, // Keeping original imports as requested
    Order, // Keeping original imports as requested
    Category,
    Customer,
    AuthResponse // Assuming this type exists for signin response { success: boolean, token?: string, data: Customer }
} from "@/types"; // Adjust path if needed
import { API_URL } from './apiUrl'; // Keeping original import as requested

// --- Configuration ---
const AUTH_TOKEN_KEY = 'authToken'; // Key for storing the token in localStorage

// --- Axios Instance Setup ---
const api = axios.create({
    baseURL: API_URL,
    // withCredentials: true, // Keeping original setting as requested (useful if backend sets other cookies or CORS needs it)
});

// --- Axios Interceptors ---

// Request Interceptor: Automatically adds the Authorization header
api.interceptors.request.use(
    (config) => {
        // Ensure this runs only in the browser
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            // If a token exists, add it to the Authorization header
            console.log(token)
            if (token) {
                config.headers = config.headers || {}; // Ensure headers object exists
                config.headers.Authorization = `Bearer ${token}`;
                // console.log(`[Request Interceptor] Added Auth header to ${config.method?.toUpperCase()} ${config.url}`); // For debugging
            }
        }
        // Return the config, potentially modified with the Authorization header
        return config;
    },
    (error) => {
        // Handle errors during request setup
        console.error("Axios Request Interceptor Error:", error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle responses globally (Keeping original logic as requested)
api.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error: AxiosError) => { // Use AxiosError type
        // handle 401 globally (Original logic kept as requested)
        if (error.response && error.response.status === 401) {
            console.error(`Unauthorized (401) accessing ${error.config?.url}! Redirecting to login...`);
            // Clear potentially invalid token that caused the 401, unless it was the signin attempt itself
            if (typeof window !== 'undefined' && error.config?.url !== '/auth/signin') {
                 localStorage.removeItem(AUTH_TOKEN_KEY);
                 console.log("Cleared potentially invalid token from localStorage due to 401.")
            }
             // Redirect (Original logic kept as requested)
             // Ensure this doesn't cause loops if /signin itself requires auth or fails
            if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
                window.location.href = "/signin?unauthorized=true"; // Added query param for context
            }
        }
        // Important: Always reject the promise so calling code's .catch() runs
        return Promise.reject(error);
    }
);

// --- Helper Function for Error Message Extraction ---
// (Useful for consistent error handling in function calls)
function getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || "An unknown API error occurred.";
    }
    return error.message || "An unknown error occurred.";
}


// --- Authentication API Functions ---
// (Modified signInUser and signOutUser for token handling)

/**
 * Signs in a user. Stores the JWT in localStorage on success.
 * Keeps original function signature and backend endpoint.
 */
export async function signInUser(credentials: { identifier: string, password: string }): Promise<Customer> {
    try {
        // Backend expected to return { success: boolean, token?: string, data: {...} }
        const response = await api.post<AuthResponse>('/auth/signin', credentials); // Original endpoint

        if (response.data.success && response.data.token) {
            // Store the token on successful login
            console.log("Sign In API Response:", response.data);
            console.log("Sign In API Response:", typeof window);
            if (typeof window !== 'undefined') {
                localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
            }
            return response.data.data; // Original return value
        } else if (response.data.success) {
             // Handle case where backend reports success but doesn't provide a token
             console.warn("Sign in reported success but no token was provided by the server.");
             throw new Error("Sign in successful, but token missing in response.");
        }
        else {
            // Handle explicit failure from backend { success: false, message: '...' }
            throw new Error(response.data.message || 'Sign in failed');
        }
    } catch (error: any) {
        const message = getErrorMessage(error);
        console.error("Sign In API Error:", message);
        // Do NOT clear token here on failed sign-in attempt, as it might be a network error
        // or the user just typed the wrong password for a valid existing token.
        throw new Error(message); // Re-throw cleaned error
    }
}

/**
 * Signs up a new user.
 * Keeps original function signature and backend endpoint.
 */
export async function signUpUser(userData: any): Promise<Customer> {
     try {
        // Using original endpoint and expected response structure
         const response = await api.post<{ success: boolean, message: string, data: Customer }>('/auth/signup', userData); // Original endpoint
         if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Sign up failed');
        }
    } catch (error: any) {
        const message = getErrorMessage(error);
        console.error("Sign Up API Error:", message);
        throw new Error(message);
    }
}

/**
 * Signs out the user by removing token from localStorage and calling backend.
 * Keeps original function signature and backend endpoint.
 */
export async function signOutUser(): Promise<{ success: boolean, message: string }> {
    try {
        // Call backend signout endpoint (Original endpoint)
        const response = await api.post<{ success: boolean, message: string }>('/auth/signout');

        // Always remove local token on explicit sign out attempt
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        return response.data;

    } catch (error: any) {
        // Attempt to clear local token even if API call fails
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        const message = getErrorMessage(error);
        console.error("Sign Out API Error:", message);
        throw new Error(message);
    }
}

/**
 * Fetches current user data. Relies on interceptor to add token.
 * Keeps original function signature and backend endpoint.
 * Returns null if not authenticated or on error.
 */
export async function getCurrentUser(): Promise<Customer | null> {
     try {
        // GET /auth/me (Original endpoint) - token added automatically by interceptor
        const response = await api.get<{ success: boolean, data: Customer }>('/auth/me');
        return response.data.success ? response.data.data : null;
    } catch (error: any) {
        // Interceptor handles 401 logging and token clearing
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 404)) {
             // Expected case for no active session
             return null;
        }
        // Log other unexpected errors
        const message = getErrorMessage(error);
        console.error("Get Current User API Error:", message);
        return null; // Indicate failure
    }
}


// --- Product API Functions (Kept exactly as in original input) ---

export async function getAllProduct(): Promise<Product[]> {
    try {
        const response = await api.get<Product[]>("/online/food/getall");
        return response.data;
    } catch (error: any) {
        // Throwing original error structure
        throw new Error(error.response?.data?.message || "Failed to fetch products"); // Adjusted generic message slightly
    }
}
export async function getProduct(id: string): Promise<Product | undefined> {
    try {
        const response = await api.get<Product>(`/online/food/getOne/${id}`);
        return response.data;
    } catch (error: any) {
        // 404 -> return undefined (Original logic)
        if (axios.isAxiosError(error) && error.response?.status === 404) { // Check error type
            console.warn(`Product with ID ${id} not found.`);
            return undefined;
        }
        console.error("Failed to fetch product:", error);
        // Returning undefined on other errors (Original logic) - consider throwing instead?
        // throw new Error(getErrorMessage(error)); // Alternative: throw an error
        return undefined;
    }
}

export async function getNewArrivals(): Promise<Product[]> {
    try {
        const response = await api.get<Product[]>('/online/food/getNewArrivals')
        return response.data
    } catch (error: any) {
        console.error("Failed to fetch new arrivals:", error)
        return [] // Original logic: return empty array
    }
}

export async function getTopSellers(): Promise<Product[]> {
    try {
        const response = await api.get<Product[]>('/online/food/getTopSellers')
        return response.data
    } catch (error: any) {
        console.error("Failed to fetch top sellers:", error)
        return [] // Original logic: return empty array
    }
}

// --- Category API Functions (Kept exactly as in original input) ---

// Note: This function was named fetchCategories but fetched products in original code. Keeping it as is.
export async function fetchCategories(): Promise<Product[]> { // Keeping original return type Product[]
    try {
        // Endpoint was '/online/category/getall' but expected Product[]? Keeping endpoint.
        const response = await api.get<Product[]>('/online/category/getall')
        return response.data
    } catch (error: any) {
        console.error("Failed to fetch categories/products:", error) // Adjusted log message
        return [] // Original logic: return empty array
    }
}

export async function getAllCategory(): Promise<Category[]> {
    try {
        const response = await api.get<Category[]>("/online/category/getall");
        return response.data;
    } catch (error: any) {
        // Throwing original error structure
        throw new Error(error.response?.data?.message || "Failed to fetch categories"); // Adjusted generic message slightly
    }
}

// Note: This function returned Category[] but endpoint suggests product info? Keeping original structure.
export async function getProductByCategory(id: string): Promise<Category[]> { // Keeping original return type Category[]
    try {
        const response = await api.get<Category[]>(`/online/category/info/${id}`);
        return response.data;
    } catch (error: any) {
        // Throwing original error structure
        throw new Error(error.response?.data?.message || "Failed to fetch category info"); // Adjusted generic message slightly
    }
}

// --- Other API Functions (Kept exactly as in original input, including potential endpoint issues) ---

export async function getDealsProduct(): Promise<Product[]> {
    try {
        // Original endpoint '/customers' likely incorrect, kept as requested. Should probably be product related.
        const response = await api.get<Product[]>("/customers");
        return response.data;
    } catch (error: any) {
        // Throwing original error structure
        throw new Error(error.response?.data?.message || "Failed to fetch deal products"); // Adjusted generic message slightly
    }
}

// Note: This seems redundant with getNewArrivals. Kept as requested.
export async function getNewArrivalsProduct(): Promise<Product[]> {
    try {
         // Original endpoint '/customers' likely incorrect, kept as requested. Should probably be product related.
        const response = await api.get<Product[]>("/customers");
        return response.data;
    } catch (error: any) {
         // Throwing original error structure
        throw new Error(error.response?.data?.message || "Failed to fetch new arrival products"); // Adjusted generic message slightly
    }
}