'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '../types';

// Define the structure of a cart item
export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

// Define the shape of the cart state
interface CartState {
  items: CartItem[];
}

// Define the types of actions that can be performed on the cart
type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { _id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// Define the shape of the context value
interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (_id: string) => void;
  updateQuantity: (_id: string, quantity: number) => void;
  clearCart: () => void;
}

// Create the context
const CartContext = createContext<CartContextValue | undefined>(undefined);

// Cart reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return { items: action.payload };

    case 'ADD_TO_CART': {
      const existingIndex = state.items.findIndex(
        (item) => item._id === action.payload._id
      );
      if (existingIndex !== -1) {
        // Item already exists; increment its quantity
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity:
            updatedItems[existingIndex].quantity + action.payload.quantity,
        };
        return { items: updatedItems };
      }
      // Otherwise, add it as a new item
      return { items: [...state.items, action.payload] };
    }

    case 'REMOVE_FROM_CART':
      return {
        items: state.items.filter((item) => item._id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
};

/**
 * Initializes the cart state from localStorage on the client
 * to avoid a "flash" of empty cart before hydration.
 */
function initCartState(initialState: CartState): CartState {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart');
    if (saved) {
      return { items: JSON.parse(saved) };
    }
  }
  return initialState;
}

// CartProvider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use the third argument to useReducer for lazy init from localStorage
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, initCartState);

  // Keep localStorage in sync whenever the cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (_id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: _id });
  };

  const updateQuantity = (_id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { _id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
