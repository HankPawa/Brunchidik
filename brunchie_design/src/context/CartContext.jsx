import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const SHIPPING = 5000;
const CART_KEY = "brunch_cart";

const parsePrice = (priceStr) =>
  parseInt(priceStr.replace(/\$|\./g, ""), 10) || 0;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, priceNum: parsePrice(item.price), qty }];
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

  const subtotal = items.reduce((sum, i) => sum + i.priceNum * i.qty, 0);
  const shipping = items.length > 0 ? SHIPPING : 0;
  const total = subtotal + shipping;
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, subtotal, shipping, total, count, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
