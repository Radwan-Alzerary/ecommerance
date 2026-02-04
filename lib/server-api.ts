// lib/server-api.ts - Server-side API functions for SSR

import { StoreSettingsPublic } from './api'
import { headers } from 'next/headers'

function parseStoreSettingsResponse(data: any): StoreSettingsPublic | null {
  if (!data) return null
  if (data.success && data.data) return data.data as StoreSettingsPublic
  if (data.data && data.data.store) return data.data as StoreSettingsPublic
  if (data.store) return data as StoreSettingsPublic
  return null
}

const FALLBACK_API = 'https://oro-system.com/'

const withTrailingSlash = (url: string): string =>
  url.endsWith('/') ? url : `${url}/`

function deriveFromOroEshopHost(hostname: string): string | null {
  const MAGIC_SUFFIX = '.oro-eshop.com'
  if (hostname.endsWith(MAGIC_SUFFIX)) {
    const tenantSlug = hostname.slice(0, -MAGIC_SUFFIX.length)
    if (tenantSlug && tenantSlug !== 'www') {
      return `https://${tenantSlug}.oro-system.com/`
    }
  }
  return null
}

function deriveFromLocalOrIpHost(hostname: string): string | null {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return `http://${hostname}:3000/`
  }
  const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(hostname)) {
    return `http://${hostname}:3000/`
  }
  return null
}

async function resolveApiUrlForServer(): Promise<string> {
  const envOverride =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.VITE_API_BASE_URL

  if (envOverride) return withTrailingSlash(envOverride)

  try {
    const h: any = headers()
    const resolved = typeof h?.then === 'function' ? await h : h
    const host = resolved?.get?.('host') || ''
    const hostname = host.split(':')[0]

    const tenantDerived = deriveFromOroEshopHost(hostname)
    if (tenantDerived) return tenantDerived

    const localOrIp = deriveFromLocalOrIpHost(hostname)
    if (localOrIp) return localOrIp
  } catch {
    // ignore
  }

  return FALLBACK_API
}

// Server-side function to fetch store settings
export async function getStoreSettingsServerSide(lang: 'ar' | 'en' = 'ar'): Promise<StoreSettingsPublic | null> {
  try {
    const apiUrl = await resolveApiUrlForServer()
    const endpoints = [
      `api/online/store-settings/public?lang=${lang}`,
      `online/store-settings/public?lang=${lang}`,
      `api/online/store-settings/lang/${lang}`,
      `online/store-settings/lang/${lang}`,
      `api/online/store-settings`,
      `online/store-settings`
    ]

    for (const endpoint of endpoints) {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        // Add cache settings for better performance
        next: { revalidate: 60 }, // Revalidate every 60 seconds
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        continue
      }

      const data = await response.json()
      const parsed = parseStoreSettingsResponse(data)
      if (parsed) return parsed
    }

    console.error('Failed to fetch store settings: all endpoints returned 404 or invalid data')
    return null
  } catch (error) {
    console.error('Error fetching store settings server-side:', error)
    return null
  }
}

// Server-side function to fetch categories
export async function getCategoriesServerSide(): Promise<any[]> {
  try {
    const apiUrl = await resolveApiUrlForServer()
    const response = await fetch(`${apiUrl}online/category/getall`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    
    // Handle both array response and {success, data} response formats
    if (Array.isArray(data)) {
      return data.map((cat: { _id: string; name: string }) => ({
        _id: cat._id,
        name: cat.name,
      }))
    } else if (data.success && Array.isArray(data.data)) {
      return data.data.map((cat: { _id: string; name: string }) => ({
        _id: cat._id,
        name: cat.name,
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error fetching categories server-side:', error)
    return []
  }
}

// Server-side function to fetch a single product
export async function getProductServerSide(id: string) {
  try {
    const apiUrl = await resolveApiUrlForServer()
    const response = await fetch(`${apiUrl}online/food/getOne/${id}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch product server-side:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    if (!data) return null
    if (data.success && data.data) return data.data
    if (data.data) return data.data
    return data
  } catch (error) {
    console.error('Error fetching product server-side:', error)
    return null
  }
}
