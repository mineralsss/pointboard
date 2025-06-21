import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem('pointboard_cart');
        if (savedCart && savedCart !== 'undefined') {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('pointboard_cart');
      } finally {
        setIsLoaded(true);
      }
    };

    loadCartFromStorage();
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pointboard_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => item._id !== productId);
      }
      
      return prevItems.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isLoaded
      }}
    >
      {children}
    </CartContext.Provider>
  );
};