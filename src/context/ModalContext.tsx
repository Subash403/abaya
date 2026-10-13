'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/types/database';

interface ModalContextType {
  isSizeGuideOpen: boolean;
  openSizeGuide: () => void;
  closeSizeGuide: () => void;

  isInquiryOpen: boolean;
  selectedProduct: Product | null;
  openInquiry: (product?: Product | null) => void;
  closeInquiry: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openSizeGuide = () => setIsSizeGuideOpen(true);
  const closeSizeGuide = () => setIsSizeGuideOpen(false);

  const openInquiry = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsInquiryOpen(true);
  };

  const closeInquiry = () => {
    setIsInquiryOpen(false);
    setSelectedProduct(null);
  };

  return (
    <ModalContext.Provider
      value={{
        isSizeGuideOpen,
        openSizeGuide,
        closeSizeGuide,
        isInquiryOpen,
        selectedProduct,
        openInquiry,
        closeInquiry,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}
