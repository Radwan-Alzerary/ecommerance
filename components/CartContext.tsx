'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { Product } from '../types'

// Define the structure of a cart item
export interface CartItem extends Product {
  _id: string // Make sure your Product type includes _id
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

// Define the shape of the cart state
interface CartState {
  items: CartItem[]
}

// Define the types of actions that can be performed on the cart
type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { _id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

// Define the shape of the context value
interface CartContextValue {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (_id: string) => void
  updateQuantity: (_id: string, quantity: number) => void
  clearCart: () => void
}

// Create the context
const CartContext = createContext<CartContextValue | undefined>(undefined)

// Cart reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return { items: action.payload }

    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(item => item._id === action.payload._id)
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        }
        return { items: updatedItems }
      }
      return { items: [...state.items, action.payload] }
    }

    case 'REMOVE_FROM_CART':
      return { items: state.items.filter(item => item._id !== action.payload) }

    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }

    case 'CLEAR_CART':
      return { items: [] }

    default:
      return state
  }
}

// CartProvider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const [hasHydrated, setHasHydrated] = useState(false)

  // Load saved cart from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      console.log('Loaded cart from localStorage:', savedCart)
      if (savedCart) {
        try {
          const parsedCart: CartItem[] = JSON.parse(savedCart)
          dispatch({ type: 'SET_CART', payload: parsedCart })
        } catch (error) {
          console.error('Error parsing saved cart:', error)
        }
      }
      setHasHydrated(true)
    }
  }, [])

  // Save cart to localStorage whenever the cart state changes
  // Only run after hydration to prevent overwriting the loaded data
  useEffect(() => {
    if (hasHydrated && typeof window !== 'undefined') {
      console.log('Saving cart to localStorage:', state.items)
      localStorage.setItem('cart', JSON.stringify(state.items))
    }
  }, [state.items, hasHydrated])

  const addToCart = (item: CartItem) => {
    console.log('Adding to cart:', item)
    dispatch({ type: 'ADD_TO_CART', payload: item })
  }

  const removeFromCart = (_id: string) => {
    console.log('Removing from cart:', _id)
    dispatch({ type: 'REMOVE_FROM_CART', payload: _id })
  }

  const updateQuantity = (_id: string, quantity: number) => {
    console.log('Updating quantity:', _id, quantity)
    dispatch({ type: 'UPDATE_QUANTITY', payload: { _id, quantity } })
  }

  const clearCart = () => {
    console.log('Clearing cart')
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{ cart: state.items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
