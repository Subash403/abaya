'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Offer } from '@/types/database';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  appliedPromo: Offer | null;
  promoCodeInput: string;
  setPromoCodeInput: (code: string) => void;
  isApplyingPromo: boolean;
  promoError: string | null;
  discountAmount: number;
  finalTotal: number;

  // Drawer & Checkout UI States
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  isCheckoutOpen: boolean;
  checkoutItems: CartItem[];
  openCheckout: (singleItem?: CartItem | null) => void;
  closeCheckout: () => void;

  // Cart Operations
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, size: string, quantity: number, notes?: string) => void;
  removeFromCart: (productId: string, size: string, notes?: string) => void;
  clearCart: () => void;
  applyPromo: (code: string) => Promise<boolean>;
  removePromo: () => void;

  // Toast feedback
  toastMessage: { text: string; image?: string; size?: string } | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'wala_abaya_atelier_bag';
const PROMO_STORAGE_KEY = 'wala_abaya_active_promo';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutOverrideItems, setCheckoutOverrideItems] = useState<CartItem[] | null>(null);

  const [appliedPromo, setAppliedPromo] = useState<Offer | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; image?: string; size?: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Hydrate from localStorage safely after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
        const storedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
        if (storedPromo) {
          const parsedPromo = JSON.parse(storedPromo);
          if (parsedPromo && parsedPromo.code) {
            setAppliedPromo(parsedPromo);
            setPromoCodeInput(parsedPromo.code);
          }
        }
      } catch (err) {
        console.warn('Could not read cart from localStorage:', err);
      } finally {
        setIsHydrated(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 2. Persist to localStorage when items or promo changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Could not write cart to localStorage:', err);
    }
  }, [items, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedPromo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch {}
  }, [appliedPromo, isHydrated]);

  // Toast Auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Derived calculations
  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const discountAmount = appliedPromo && subtotal > 0
    ? Math.round((subtotal * appliedPromo.discount_percentage) / 100)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Add To Cart
  const addToCart = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
    const normalizedNotes = (newItem.customAlterationNotes || '').trim();

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          (i.customAlterationNotes || '').trim() === normalizedNotes
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qtyToAdd,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: newItem.productId,
          name: newItem.name,
          slug: newItem.slug,
          price: newItem.price,
          image: newItem.image,
          size: newItem.size,
          quantity: qtyToAdd,
          customAlterationNotes: normalizedNotes || undefined,
        },
      ];
    });

    setToastMessage({
      text: `Added "${newItem.name}" (Size ${newItem.size}) to Bag`,
      image: newItem.image,
      size: newItem.size,
    });
  }, []);

  // Update Quantity
  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number, notes?: string) => {
      const normalizedNotes = (notes || '').trim();
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.size === size &&
                (i.customAlterationNotes || '').trim() === normalizedNotes
              )
          );
        }

        return prev.map((item) => {
          if (
            item.productId === productId &&
            item.size === size &&
            (item.customAlterationNotes || '').trim() === normalizedNotes
          ) {
            return { ...item, quantity };
          }
          return item;
        });
      });
    },
    []
  );

  // Remove Line Item
  const removeFromCart = useCallback((productId: string, size: string, notes?: string) => {
    const normalizedNotes = (notes || '').trim();
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.size === size &&
            (i.customAlterationNotes || '').trim() === normalizedNotes
          )
      )
    );
  }, []);

  // Clear Cart
  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(PROMO_STORAGE_KEY);
    } catch {}
  }, []);

  // Apply Promo
  const applyPromo = useCallback(
    async (code: string): Promise<boolean> => {
      const cleanCode = code.trim();
      if (!cleanCode) {
        setPromoError('Please enter a coupon code.');
        return false;
      }

      setIsApplyingPromo(true);
      setPromoError(null);

      try {
        const res = await fetch(`/api/admin/offers?code=${encodeURIComponent(cleanCode)}`);
        const data = await res.json();

        if (res.ok && data.offers && data.offers.length > 0) {
          const match: Offer = data.offers[0];
          setAppliedPromo(match);
          setPromoCodeInput(match.code || cleanCode);
          setPromoError(null);
          return true;
        } else {
          setPromoError('Invalid or expired coupon code.');
          return false;
        }
      } catch {
        // Fallback for default WALA15 promo
        if (cleanCode.toUpperCase() === 'WALA15') {
          const fallbackOffer: Offer = {
            id: 'default-wala15',
            created_at: new Date().toISOString(),
            title: 'WALA15 Atelier Special',
            code: 'WALA15',
            discount_percentage: 15,
            banner_text: null,
            is_active: true,
            show_in_banner: true,
          };
          setAppliedPromo(fallbackOffer);
          setPromoCodeInput('WALA15');
          setPromoError(null);
          return true;
        }
        setPromoError('Could not verify coupon. Please try again.');
        return false;
      } finally {
        setIsApplyingPromo(false);
      }
    },
    []
  );

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const openCheckout = (singleItem?: CartItem | null) => {
    if (singleItem) {
      setCheckoutOverrideItems([singleItem]);
    } else {
      setCheckoutOverrideItems(null);
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutOverrideItems(null);
  };

  const checkoutItems = checkoutOverrideItems || items;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        appliedPromo,
        promoCodeInput,
        setPromoCodeInput,
        isApplyingPromo,
        promoError,
        discountAmount,
        finalTotal,

        isCartOpen,
        openCart,
        closeCart,
        toggleCart,

        isCheckoutOpen,
        checkoutItems,
        openCheckout,
        closeCheckout,

        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromo,
        removePromo,

        toastMessage,
        clearToast: () => setToastMessage(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
