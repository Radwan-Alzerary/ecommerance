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
    CustomSection,
    NotificationItem
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
            if (error.config?.url !== '/auth/me') {
                console.warn(`Unauthorized (401) accessing ${error.config?.url}!`);
            }
            // Clear potentially invalid token that caused the 401, unless it was the signin attempt itself
            if (typeof window !== 'undefined' && error.config?.url !== '/auth/signin') {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                console.log("Cleared potentially invalid token from localStorage due to 401.")
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

export interface PaginatedProductsParams {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'price-low' | 'price-high' | 'rating' | 'name';
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
}

export interface PaginatedProductsResult {
    items: Product[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export async function getProductsPaginated(params: PaginatedProductsParams = {}): Promise<PaginatedProductsResult> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    try {
        const response = await api.get<any>('/online/food', {
            params: {
                page,
                limit,
                sort: params.sort,
                search: params.search,
                category: params.category,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
                colors: params.colors?.join(','),
                sizes: params.sizes?.join(','),
            }
        });

        const data = response.data;

        const items: Product[] = Array.isArray(data)
            ? data
            : (data.data || data.items || data.products || []);

        const pagination = data.pagination || {};
        const total = pagination.total ?? data.total ?? data.count ?? items.length;
        const resolvedPage = pagination.page ?? data.page ?? page;
        const resolvedLimit = pagination.limit ?? data.limit ?? limit;
        const totalPages = pagination.totalPages ?? data.totalPages ?? Math.max(1, Math.ceil(total / resolvedLimit));

        return {
            items,
            page: resolvedPage,
            limit: resolvedLimit,
            total,
            totalPages
        };
    } catch (error: any) {
        const message = getErrorMessage(error);
        console.error("Failed to fetch paginated products:", message);
        throw new Error(message);
    }
}

function parseNotificationsResponse(data: any): NotificationItem[] {
    if (!data) return [];
    if (Array.isArray(data)) return data as NotificationItem[];
    if (data.success && Array.isArray(data.data)) return data.data as NotificationItem[];
    if (Array.isArray(data.items)) return data.items as NotificationItem[];
    return [];
}

export async function getNotifications(): Promise<NotificationItem[]> {
    const endpoints = ['/api/notifications', '/online/notifications', '/notifications'];
    for (const endpoint of endpoints) {
        try {
            const response = await api.get<any>(endpoint);
            const parsed = parseNotificationsResponse(response.data);
            if (parsed.length > 0 || response.status === 200) return parsed;
        } catch (error: any) {
            if (error?.response?.status !== 404 && error?.response?.status !== 401) {
                console.warn('Notifications fetch failed:', error);
            }
        }
    }
    return [];
}

export async function markNotificationRead(id: string): Promise<void> {
    if (!id) return;
    const endpoints = [`/api/notifications/${id}/read`, `/online/notifications/${id}/read`, `/notifications/${id}/read`];
    for (const endpoint of endpoints) {
        try {
            await api.post(endpoint);
            return;
        } catch (error: any) {
            if (error?.response?.status !== 404 && error?.response?.status !== 401) {
                console.warn('Mark notification read failed:', error);
            }
        }
    }
}

export async function markAllNotificationsRead(): Promise<void> {
    const endpoints = ['/api/notifications/read-all', '/online/notifications/read-all', '/notifications/read-all'];
    for (const endpoint of endpoints) {
        try {
            await api.post(endpoint);
            return;
        } catch (error: any) {
            if (error?.response?.status !== 404 && error?.response?.status !== 401) {
                console.warn('Mark all notifications read failed:', error);
            }
        }
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

function parseCategoryInfoResponse(data: any) {
    if (!data) return null;
    if (data.success && data.data) return data.data;
    if (data.data) return data.data;
    return data;
}

// Note: This function returned Category[] but endpoint suggests product info? Keeping original structure.
export async function getProductByCategory(idOrName: string): Promise<any> {
    try {
        const encoded = encodeURIComponent(idOrName);
        const endpoints = [
            `/online/category/info/${encoded}`,
            `/online/category/info?name=${encoded}`,
            `/online/category/info?slug=${encoded}`
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await api.get<any>(endpoint);
                const parsed = parseCategoryInfoResponse(response.data);
                if (parsed) return parsed;
            } catch (innerError: any) {
                if (innerError?.response?.status !== 404) {
                    throw innerError;
                }
            }
        }

        throw new Error("Failed to fetch category info");
    } catch (error: any) {
        // Throwing original error structure
        throw new Error(error.response?.data?.message || error.message || "Failed to fetch category info");
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
