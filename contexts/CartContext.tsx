'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '../types'; // Ensure Product has _id: string

// Define the structure of a cart item
export interface CartItem extends Product { // Ensure Product (and thus CartItem) has _id
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
  | { type: 'REMOVE_FROM_CART'; payload: string } // payload is _id
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
        (item) => item._id === action.payload._id // Assumes _id exists on CartItem
      );
      if (existingIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity:
            updatedItems[existingIndex].quantity + action.payload.quantity,
        };
        return { items: updatedItems };
      }
      return { items: [...state.items, action.payload] };
    }

    case 'REMOVE_FROM_CART':
      return {
        items: state.items.filter((item) => item._id !== action.payload), // action.payload is the _id
      };

    case 'UPDATE_QUANTITY':
      // This case now assumes quantity will always be > 0 because
      // the updateQuantity context function handles the <= 0 case by dispatching REMOVE_FROM_CART.
      // If an item with quantity 0 *should* remain, this reducer would need to handle it.
      // But typically, quantity 0 means removal.
      if (action.payload.quantity <= 0) { // Defensive check, though updateQuantity should prevent this
        return {
          items: state.items.filter((item) => item._id !== action.payload._id),
        };
      }
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

function initCartState(initialState: CartState): CartState {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsedItems = JSON.parse(saved);
        // Basic validation to ensure parsedItems is an array
        if (Array.isArray(parsedItems)) {
          return { items: parsedItems };
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        // Fallback to initial state if parsing fails
      }
    }
  }
  return initialState;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, initCartState);

  // حفظ السلة في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
    // إطلاق حدث لإعلام المكونات الأخرى
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: state.items }));
  }, [state.items]);

  // الاستماع لتغييرات localStorage من نوافذ/تابات أخرى
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && e.newValue) {
        try {
          const newItems = JSON.parse(e.newValue);
          if (Array.isArray(newItems)) {
            dispatch({ type: 'SET_CART', payload: newItems });
          }
        } catch (error) {
          console.error('Error parsing cart from storage event:', error);
        }
      }
    };

    const handleCartUpdate = () => {
      // إعادة قراءة السلة من localStorage
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          const parsedItems = JSON.parse(saved);
          if (Array.isArray(parsedItems)) {
            dispatch({ type: 'SET_CART', payload: parsedItems });
          }
        } catch (error) {
          console.error('Error parsing cart:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (_id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: _id });
  };

  const updateQuantity = (_id: string, quantity: number) => {
    if (quantity <= 0) {
      // If desired quantity is 0 or less, remove the item from the cart
      dispatch({ type: 'REMOVE_FROM_CART', payload: _id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { _id, quantity } });
    }
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};