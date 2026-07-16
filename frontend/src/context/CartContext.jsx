import { useEffect, useState } from 'react';
import { CartContext } from './cart-context';

const STORAGE_KEY = 'cart';

const lineKey = (item) => `${item.productId}:${item.variantId || 'default'}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item, quantity = 1) => {
    setItems((prev) => {
      const key = lineKey(item);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, item.maxStock ?? Infinity);
        return prev.map((i) => (lineKey(i) === key ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock ?? Infinity) }];
    });
  };

  const removeItem = (item) => {
    const key = lineKey(item);
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  };

  const updateQuantity = (item, quantity) => {
    const key = lineKey(item);
    setItems((prev) =>
      prev.map((i) =>
        lineKey(i) === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock ?? Infinity)) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}
