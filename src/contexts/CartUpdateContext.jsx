import React, { createContext, useContext, useReducer } from 'react';

const CartUpdateContext = createContext();

export const useCartUpdate = () => {
  const context = useContext(CartUpdateContext);
  if (!context) {
    throw new Error('useCartUpdate must be used within a CartUpdateProvider');
  }
  return context;
};

export const CartUpdateProvider = ({ children }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  return (
    <CartUpdateContext.Provider value={{ forceUpdate }}>
      {children}
    </CartUpdateContext.Provider>
  );
};