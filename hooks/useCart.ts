'use client';

import { useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Helper function to safely get initial state from localStorage
function getInitialCart(): CartItem[] {
  // Check if running on the client side
  if (typeof window === 'undefined') {
    return []; // Return empty array during SSR or build time
  }
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error);
    // Optionally clear corrupted data: localStorage.removeItem('cart');
  }
  return []; // Return empty array if nothing saved or parsing fails
}

export function useCart() {
  // Initialize state using the helper function
  // This function runs ONLY ONCE on initial mount
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);

  // Effect to SAVE cart changes to localStorage
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }
    // Dependency array: Run whenever 'cart' state changes
  }, [cart]);

  // --- Cart manipulation functions (no changes needed here) ---

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        // Increase quantity if item exists
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i // Use item.quantity for flexibility
        );
      }
      // Add new item if it doesn't exist (ensure quantity is at least 1)
      return [...prevCart, { ...item, quantity: item.quantity > 0 ? item.quantity : 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    // Prevent negative or zero quantity if desired
    if (quantity <= 0) {
      removeFromCart(id); // Remove item if quantity is zero or less
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

   const clearCart = () => {
    setCart([]); // Clears the cart state, which will trigger the useEffect to update localStorage
  };

  // Optional: Calculate total items/price
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);


  return {
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    };
}