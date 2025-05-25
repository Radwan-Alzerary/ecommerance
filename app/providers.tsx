'use client'

import { ReactNode } from 'react'
import { CartProvider } from '@/contexts/CartContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { AuthProvider } from '@/contexts/AuthContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
      <CartProvider>
        <ThemeProvider>
          <LanguageProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </LanguageProvider>
        </ThemeProvider>
      </CartProvider>
  )
}

