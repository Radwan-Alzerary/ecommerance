// lib/api.ts (or utils/api.ts etc.)

import axios, { AxiosError } from 'axios'; // Import AxiosError
import { getSession } from 'next-auth/react'
import {
    Product,
    User, // Keeping original imports as requested
    Order, // Keeping original imports as requested
    Category,
    Customer,
    AuthResponse, // Assuming this type exists for signin response { success: boolean, token?: string, data: Customer }
    CartItem,
    HeroSlide,
    CustomSection
} from "@/types"; // Adjust path if needed
import { API_URL, getApiUrl } from './apiUrl'; // Import getApiUrl for per-request baseURL

// --- Configuration ---
const AUTH_TOKEN_KEY = 'authToken'; // Key for storing the token in localStorage (fallback for custom auth)

// --- Axios Instance Setup ---
export const api = axios.create({
    baseURL: API_URL,
    // withCredentials: true, // Keeping original setting as requested (useful if backend sets other cookies or CORS needs it)
});

// --- Axios Interceptors ---

// Request Interceptor: Automatically adds the Authorization header
api.interceptors.request.use(
    async (config) => {
        // Always set baseURL at request time to support dynamic subdomains (SSR & CSR)
        try {
            config.baseURL = getApiUrl();
        } catch (e) {
            // fallback silently to default API_URL if per-request resolution fails
            config.baseURL = API_URL;
        }
        // Try to get NextAuth session first
        try {
            const session = await getSession()
            // For social auth, we might not have a traditional token
            // Most social auth doesn't require additional API tokens
            if (session?.user) {
                // For social auth, we can pass user info or handle differently
                // You might want to create a custom token or use session data
                console.log('User authenticated via NextAuth:', session.user.email)
            }
        } catch (error) {
            console.warn('Failed to get NextAuth session:', error)
        }

        // Fallback to localStorage token for custom auth (email/password)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            console.log(token)
            if (token) {
                config.headers = config.headers || {}; // Ensure headers object exists
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
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
 * Fetches current user data. Works with both NextAuth and custom auth.
 * Returns null if not authenticated or on error.
 */
export async function getCurrentUser(): Promise<Customer | null> {
    try {
        // First check NextAuth session
        const session = await getSession()
        if (session?.user) {
            // Convert NextAuth user to Customer format
            return {
                _id: (session.user as any).id || '',
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Add other Customer fields with defaults
                phone: '',
                address: '',
                dateOfBirth: null,
                gender: '',
                preferences: {},
                loyaltyPoints: 0,
                isActive: true,
                orders: []
            } as Customer
        }

        // Fallback to API call for custom auth
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

/**
 * Check if user is authenticated (either via NextAuth or custom auth)
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        // Check NextAuth session first
        const session = await getSession()
        if (session?.user) {
            return true
        }

        // Check localStorage token
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(AUTH_TOKEN_KEY)
            return !!token
        }

        return false
    } catch (error) {
        console.error('Error checking authentication:', error)
        return false
    }
}

export async function getCustomerProfile(): Promise<Customer | null> {
    try {
        // Ensure your Customer type in "@/types" includes an 'invoice: Order[]' field (or similar).
        // The backend for '/api/customers/me' should populate these invoices.
        const response = await api.get<{ success: boolean; data: Customer }>('/api/customer/me');

        if (response.data.success && response.data.data) {
            return response.data.data;
        } else {
            // Handle cases where success is true but no data, or success is false
            console.warn("Get Customer Profile: Request successful but data issue or explicit failure.", "No customer data returned.");
            return null;
        }
    } catch (error: any) {
        // The global response interceptor handles general 401 logging and redirection.
        // Specific handling for 401/404 in this context can return null to the caller.
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 404)) {
            console.warn(`Get Customer Profile: Received ${error.response?.status} status. ${error.message}`);
            return null; // Indicates profile not found or user not authenticated for this resource
        }
        // For other errors, log and return null.
        const message = getErrorMessage(error);
        console.error("Get Customer Profile API Error:", message);
        return null;
    }
}


// --- Product API Functions (Kept exactly as in original input) ---

export async function getAllProduct(): Promise<Product[]> {
    try {
        console.log("📡 API Request: GET /online/food/getall");
        console.log("📡 Base URL:", api.defaults.baseURL);
        const response = await api.get<Product[]>("/online/food/getall");
        console.log("✅ API Response received:", response.status);
        console.log("✅ Response data type:", typeof response.data);
        console.log("✅ Is array:", Array.isArray(response.data));
        console.log("✅ Data length:", response.data?.length);
        return response.data;
    } catch (error: any) {
        console.error("❌ API Error:", error.message);
        console.error("❌ Error response:", error.response?.data);
        // Throwing original error structure
        throw new Error(error.response?.data?.message || "Failed to fetch products"); // Adjusted generic message slightly
    }
}
// --- Fixed version: handles CSR **and** SSR correctly
export async function getProduct(id: string): Promise<Product | undefined> {
  try {
    // build an absolute URL so it works even when `window` is undefined (SSR)
        const response = await api.get<Product>(`/online/food/getOne/${id}`);

        return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(`Product with ID ${id} not found.`);
      return undefined;
    }
    console.error("Failed to fetch product:", error);
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

// --- Hero Slides API Function ---

export async function getHeroSlides(): Promise<HeroSlide[]> {
    try {
        // Try the online market endpoint first
        const response = await api.get<{success: boolean, data: HeroSlide[]} | HeroSlide[]>('/online/hero-slides')
        
        // Handle both response formats
        if (Array.isArray(response.data)) {
            return response.data
        } else if (response.data.success) {
            return response.data.data
        } else {
            throw new Error('Failed to fetch hero slides from server')
        }
    } catch (error: any) {
        console.error("Online hero slides endpoint not available:", error)
        
        // Try the API endpoint as fallback
        try {
            const fallbackResponse = await api.get<{success: boolean, data: HeroSlide[]} | HeroSlide[]>('/api/hero-slides')
            
            if (Array.isArray(fallbackResponse.data)) {
                return fallbackResponse.data
            } else if (fallbackResponse.data.success) {
                return fallbackResponse.data.data
            }
        } catch (fallbackError) {
            console.error("API hero slides endpoint also not available:", fallbackError)
        }
        
        // If both endpoints fail, throw error to show the error state in component
        throw new Error('Hero slides API endpoints are not available. Please ensure the backend routes are properly deployed.')
    }
}

// --- Custom Sections API Functions ---

export async function getCustomSections(): Promise<CustomSection[]> {
    try {
        const response = await api.get<{success: boolean, data: CustomSection[]}>('/online/custom/sections?includeInactive=false&populateProducts=true')
        
        if (response.data.success) {
            return response.data.data
        } else {
            throw new Error('Failed to fetch custom sections from server')
        }
    } catch (error: any) {
        console.error("Failed to fetch custom sections:", error)
        throw new Error(getErrorMessage(error))
    }
}

// --- Store Settings API ---

export type Bilingual<T = string> = { ar?: T; en?: T }
export interface StoreSettingsFull {
    storeId: string
    logo: { type: 'text'|'text-circle'|'image'|'image-text'; textColor: string; imageUrl?: string }
    store: { name: Bilingual; type: string; description: Bilingual; primaryColor: string }
    strengths: Array<{ icon: string; title: Bilingual; description: Bilingual; order: number }>
    socialMedia: { facebook?: string; x?: string; youtube?: string; instagram?: string; linkedin?: string }
    aboutUs: Bilingual
    seo: { metaTitle: Bilingual; metaDescription: Bilingual; keywords: string[] }
    display: { showStrengths: boolean; showSocialMedia: boolean; showAboutUs: boolean; strengthsLayout: 'grid'|'list'|'carousel' }
    isActive: boolean
    logoUrl?: string | null
    version: number
    createdAt: string
    updatedAt: string
}

export interface StoreSettingsPublic {
    store: { name: string; type: string; description?: string; primaryColor: string }
    strengths: Array<{ icon: string; title: string; description?: string; order: number }>
    socialMedia: { facebook?: string; x?: string; youtube?: string; instagram?: string; linkedin?: string }
    aboutUs?: string
    seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] }
    logo: { type: 'text'|'text-circle'|'image'|'image-text'; textColor: string; imageUrl?: string }
}

export async function getStoreSettingsFull(): Promise<StoreSettingsFull | null> {
    try {
        const res = await api.get<{ success: boolean; data: StoreSettingsFull }>(`/api/online/store-settings`)
        return res.data.success ? res.data.data : null
    } catch (e) {
        console.error('Failed to fetch store settings (full):', e)
        return null
    }
}

export async function getStoreSettingsByLang(lang: 'ar'|'en' = 'ar'): Promise<StoreSettingsPublic | null> {
    try {
        const res = await api.get<{ success: boolean; data: StoreSettingsPublic }>(`/api/online/store-settings/lang/${lang}`)
        return res.data.data
    } catch (e) {
        console.error('Failed to fetch store settings by lang:', e)
        return null
    }
}

export async function getStoreSettingsPublic(lang: 'ar'|'en' = 'ar'): Promise<StoreSettingsPublic | null> {
    try {
        const res = await api.get<{ success: boolean; data: StoreSettingsPublic }>(`/api/online/store-settings/public?lang=${lang}`)
        return res.data.data
    } catch (e) {
        console.error('Failed to fetch store settings public:', e)
        return null
    }
}

export async function getCustomSectionById(id: string): Promise<CustomSection | null> {
    try {
        const response = await api.get<{success: boolean, data: CustomSection}>(`/online/custom/sections/${id}?populateProducts=true`)
        
        if (response.data.success) {
            return response.data.data
        } else {
            return null
        }
    } catch (error: any) {
        console.error(`Failed to fetch custom section ${id}:`, error)
        return null
    }
}

export async function getSectionProducts(sectionId: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
}): Promise<{products: Product[], pagination: any, section: any}> {
    try {
        const queryParams = new URLSearchParams()
        if (params?.page) queryParams.append('page', params.page.toString())
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
        
        const response = await api.get<{success: boolean, data: Product[], pagination: any, section: any}>(`/online/custom/sections/${sectionId}/products?${queryParams}`)
        
        if (response.data.success) {
            return {
                products: response.data.data,
                pagination: response.data.pagination,
                section: response.data.section
            }
        } else {
            throw new Error('Failed to fetch section products')
        }
    } catch (error: any) {
        console.error(`Failed to fetch section products for ${sectionId}:`, error)
        throw new Error(getErrorMessage(error))
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





export interface CreateOrderPayload {
    shippingInfo: {
        name: string;
        phone: string;
        address?: string; // Optional if shippingType is 'internal'
        city?: string;    // Optional
        country?: string; // Optional
        landmark?: string;
        notes: string;
        shippingType: 'internal' | 'external';
    };
    // Instead of sending the whole user object, usually, you send `userId`
    // or the backend infers it from the auth token. Let's assume `userId` is preferred.
    userId: string | undefined; // Or just rely on backend to get it from token
    items: CartItem[]; // Ensure CartItem includes productId, quantity, price
    totalAmount: number;
    shippingFee: number;
    // Add any other fields your backend expects (e.g., paymentMethodId, couponCode, etc.)
}

// Define the expected response structure from the backend after creating an order
export interface CreateOrderResponse {
    success: boolean;
    message?: string;
    data?: Order; // The created order object
}

/**
 * Submits the order to the backend.
 */
export async function submitOrder(payload: CreateOrderPayload): Promise<Order> {
    try {
        // Assuming the backend returns the created order directly or nested under 'data'
        const response = await api.post<CreateOrderResponse>('/api/orders/create', payload);

        if (response.data.success && response.data.data) {
            return response.data.data; // Return the Order object
        } else if (response.data.success && !response.data.data) {
            // Success true, but no order data. This case needs clarification based on backend behavior.
            // For now, throw an error or return a minimal Order-like object if appropriate.
            console.warn("Order creation reported success but no order data was returned.");
            throw new Error(response.data.message || 'Order created, but no order details received.');
        }
        else {
            throw new Error(response.data.message || 'Failed to create order. Please try again.');
        }
    } catch (error: any) {
        const message = getErrorMessage(error);
        console.error("Submit Order API Error:", message, error.response?.data);
        throw new Error(message);
    }
}
