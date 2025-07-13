import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { v4 as uuidv4 } from 'uuid';
import { setupProductUpdateListeners, joinUserRoom, disconnectSocket } from '../socket';

// Create context
const CartContext = createContext(null);

// Cart provider component
export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [cartItems, setCartItems] = useState([]);
  const initialized = useRef(false);
  
  // Store last known user ID for persistence
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      localStorage.setItem('last_user_id', user.sub);
    }
  }, [isAuthenticated, user]);
  
  // Get or create a persistent device ID for guest users
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }, []);

  // Get the appropriate storage key based on auth state
  const getStorageKey = useCallback(() => {
    // If authenticated, use user ID
    if (isAuthenticated && user?.sub) {
      return `cart_${user.sub}`;
    }
    
    // If not authenticated but we know the last user, use that for persistence
    const lastUserId = localStorage.getItem('last_user_id');
    if (lastUserId) {
      return `cart_${lastUserId}`;
    }
    
    // Fallback to device ID
    return `cart_${getDeviceId()}`;
  }, [isAuthenticated, user, getDeviceId]);
  
  // Load cart from localStorage ONCE when auth state is determined
  useEffect(() => {
    // Wait until Auth0 has finished loading
    if (isLoading) {
      return;
    }
    
    // Only run this once after auth is determined
    if (!initialized.current) {
      const storageKey = getStorageKey();
      console.log(`Loading cart using key: ${storageKey}`);
      
      try {
        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log(`Found ${parsedCart.length} items in cart`);
          setCartItems(parsedCart);
        } else {
          console.log('No existing cart found');
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
      
      initialized.current = true;
    }
  }, [isLoading, isAuthenticated, user, getStorageKey]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Skip initial empty cart save before we've loaded from localStorage
    if (!initialized.current) {
      return;
    }
    
    const storageKey = getStorageKey();
    console.log(`Saving ${cartItems.length} items to cart: ${storageKey}`);
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, isAuthenticated, user, getStorageKey]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const exists = prevItems.find(item => item.name === product.name);
      if (!exists) {
        // Ensure all required fields are included
        const cartProduct = {
          _id: product._id || product.productID,
          productID: product._id || product.productID,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          farmerID: product.farmerID,
          image: product.image || product.img
        };
        
        console.log('Adding product to cart:', cartProduct.name);
        return [...prevItems, cartProduct];
      }
      return prevItems;
    });
  };

  const removeFromCart = (productName) => {
    console.log(`Removing product from cart: ${productName}`);
    setCartItems(prevItems => 
      prevItems.filter(item => item.name !== productName)
    );
  };

  const clearCart = () => {
    console.log('Clearing entire cart');
    setCartItems([]);
  };

  const updateCartItem = useCallback((productId, updatedProduct) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId || item.productID === productId
          ? { ...item, ...updatedProduct }
          : item
      )
    );
  }, []);

  // Setup socket listeners for real-time updates
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      // Join user to socket room
      joinUserRoom(user.sub);
      
      // Setup product update listeners
      setupProductUpdateListeners(updateCartItem, null);
      
      // Cleanup on unmount
      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, user?.sub, updateCartItem]);

  // Debug display current state
  console.log(`Cart Context State - Auth: ${isAuthenticated}, Loading: ${isLoading}, Items: ${cartItems.length}`);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        currentUser: user
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using cart
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
