import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth, API_BASE_URL } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart when user changes
  useEffect(() => {
    if (token && user) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [token, user]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    if (!token) {
      alert('Please login to add books to your cart!');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId, quantity })
      });

      if (response.ok) {
        await loadCart();
        return true;
      } else {
        const err = await response.json();
        alert(err.message || 'Error adding to cart');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateCartQty = async (bookId, quantity) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId, quantity })
      });

      if (response.ok) {
        await loadCart();
        return true;
      } else {
        const err = await response.json();
        alert(err.message || 'Error updating cart');
        return false;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const removeFromCart = async (bookId) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadCart();
        return true;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      loadCart,
      totalItems,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
