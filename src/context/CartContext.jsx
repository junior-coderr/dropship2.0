'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(false);
  const { user, token, openAuthDrawer } = useAuth();  // Add openAuthDrawer

  // Fetch cart on auth change
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('Cart items:', data.cart.items);
        setCart(data.cart.items.map(item => ({
          id: item.productId._id,
          name: item.productId.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          images: item.productId.images
        })));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart items');
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      openAuthDrawer(); // Open the auth drawer when user is not logged in
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: product.quantity || 1,
          size: product.size || null,
          color: product.color || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart();
        toast.success('Added to cart');
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const removeFromCart = async (productId, size, color) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('productId', productId);
      if (size) queryParams.append('size', size);
      if (color) queryParams.append('color', color);

      const response = await fetch(`/api/cart?${queryParams.toString()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart();
        toast.success('Removed from cart');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (productId, size, color, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Add item to loading set
    setLoadingItems(prev => new Set(prev).add(`${productId}-${size}-${color}`));
    
    try {
      const response = await fetch('/api/cart/update-quantity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
          size,
          color
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCart(prevCart => 
          prevCart.map(item => 
            item.id === productId && item.size === size && item.color === color
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      // Remove item from loading set
      setLoadingItems(prev => {
        const next = new Set(prev);
        next.delete(`${productId}-${size}-${color}`);
        return next;
      });
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      loadingItems,
      addingToCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
