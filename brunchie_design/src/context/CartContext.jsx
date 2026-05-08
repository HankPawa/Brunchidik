import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

const parsePrice = (priceStr) =>
  parseInt(priceStr.replace(/\$|\./g, ""), 10);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, priceNum: parsePrice(item.price), qty: 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (name) =>
    setItems((prev) => prev.filter((i) => i.name !== name));

  const updateQty = (name, qty) => {
    if (qty < 1) return removeFromCart(name);
    setItems((prev) => prev.map((i) => (i.name === name ? { ...i, qty } : i)));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.priceNum * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
