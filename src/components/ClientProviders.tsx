'use client';

import React from 'react';
import { ModalProvider } from '@/context/ModalContext';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutModal from '@/components/cart/CheckoutModal';
import CartToast from '@/components/cart/CartToast';
import SizeGuideModal from '@/components/SizeGuideModal';
import OrderInquiryModal from '@/components/OrderInquiryModal';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <CheckoutModal />
        <CartToast />
        <SizeGuideModal />
        <OrderInquiryModal />
      </CartProvider>
    </ModalProvider>
  );
}
