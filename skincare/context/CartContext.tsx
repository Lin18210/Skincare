import React, { createContext, useContext, useState } from 'react';
import api from '../lib/api';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    brand: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  fetchCart: () => Promise<void>;
  addToCart: (product_id: string, quantity?: number) => Promise<void>;
  updateCartItem: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart');
      setCartItems(res.data);
    } catch { setCartItems([]); }
  };

  const addToCart = async (product_id: string, quantity = 1) => {
    await api.post('/api/cart', { product_id, quantity });
    await fetchCart();
  };

  const updateCartItem = async (id: string, quantity: number) => {
    await api.put(`/api/cart/${id}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (id: string) => {
    await api.delete(`/api/cart/${id}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/api/cart');
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.quantity * (i.products?.price || 0), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, fetchCart, addToCart, updateCartItem, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
