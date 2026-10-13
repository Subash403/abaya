'use client';

import React, { useState } from 'react';
import { useModals } from '@/context/ModalContext';
import {
  X,
  Send,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Sparkles,
  AlertCircle,
  Tag,
  Check,
} from 'lucide-react';
import { OrderInquiryFormData } from '@/types/database';

export default function OrderInquiryModal() {
  const { isInquiryOpen, selectedProduct, closeInquiry, openSizeGuide } = useModals();

  const [formData, setFormData] = useState<OrderInquiryFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    shipping_address: '',
    city: 'Chennai',
    product_id: '',
    product_name: 'Bespoke Modest Abaya',
    selected_size: '56',
    custom_height: '',
    custom_notes: '',
    applied_discount_code: '',
    discount_amount: 0,
    final_price: 0,
  });

  const [couponInput, setCouponInput] = useState('');
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [couponStatus, setCouponStatus] = useState<{
    valid: boolean;
    message: string;
    percentage?: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    orderId: string;
    whatsappUrl: string;
  } | null>(null);

  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const currentSyncKey = isInquiryOpen ? `${selectedProduct?.id || 'bespoke'}` : null;

  // Sync selected product if modal opens or product changes (React state-during-render pattern)
  if (isInquiryOpen && prevSyncKey !== currentSyncKey) {
    setPrevSyncKey(currentSyncKey);
    const basePrice = selectedProduct?.price || 0;
    if (selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        selected_size: selectedProduct.sizes?.[0] || '56',
        applied_discount_code: '',
        discount_amount: 0,
        final_price: basePrice,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        product_id: '',
        product_name: 'Bespoke Modest Abaya',
        selected_size: '56',
        applied_discount_code: '',
        discount_amount: 0,
        final_price: 0,
      }));
    }
    setCouponInput('');
    setCouponStatus(null);
    setSubmittedData(null);
    setErrorMessage(null);
  } else if (!isInquiryOpen && prevSyncKey !== null) {
    setPrevSyncKey(null);
  }

  if (!isInquiryOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    setIsVerifyingCoupon(true);
    setCouponStatus(null);
    try {
      const res = await fetch(`/api/admin/offers?code=${encodeURIComponent(couponInput.trim())}`);
      const data = await res.json();

      if (res.ok && data.offers && data.offers.length > 0) {
        const offer = data.offers[0];
        const basePrice = selectedProduct?.price || Number(formData.final_price) || 0;
        const discountAmt = Math.round((basePrice * Number(offer.discount_percentage)) / 100);
        const newFinal = Math.max(0, basePrice - discountAmt);

        setFormData((prev) => ({
          ...prev,
          applied_discount_code: offer.code || couponInput.trim().toUpperCase(),
          discount_amount: discountAmt,
          final_price: newFinal,
        }));

        setCouponStatus({
          valid: true,
          message: `${offer.title} (${offer.discount_percentage}% OFF applied)`,
          percentage: Number(offer.discount_percentage),
        });
      } else {
        setCouponStatus({
          valid: false,
          message: 'Invalid or expired promotional code.',
        });
      }
    } catch {
      setCouponStatus({
        valid: false,
        message: 'Could not verify coupon code.',
      });
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    const basePrice = selectedProduct?.price || 0;
    setFormData((prev) => ({
      ...prev,
      applied_discount_code: '',
      discount_amount: 0,
      final_price: basePrice,
    }));
    setCouponInput('');
    setCouponStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit bespoke inquiry.');
      }

      setSubmittedData({
        orderId: result.order_id,
        whatsappUrl: result.whatsapp_url,
      });

      // Automatically launch WhatsApp window/tab
      if (typeof window !== 'undefined' && result.whatsapp_url) {
        window.open(result.whatsapp_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/75 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-xl bg-[#FFFFFF] border border-[#E8E8EC] shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8EC] bg-[#18181B] text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#7C5C8A]" />
            <div>
              <h3 className="font-serif text-lg tracking-wider text-white uppercase font-semibold">
                Bespoke Order Inquiry
              </h3>
              <p className="text-[10px] tracking-widest text-[#7C5C8A] uppercase font-semibold">
                Wala Abaya • Chennai Atelier Concierge
              </p>
            </div>
          </div>
          <button
            onClick={closeInquiry}
            className="p-1 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submittedData ? (
            /* Success State */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#7C5C8A]/10 border-2 border-[#7C5C8A] flex items-center justify-center text-[#7C5C8A] shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] tracking-widest text-[#7C5C8A] uppercase font-bold">
                  Inquiry Dispatched
                </span>
                <h3 className="font-serif text-2xl text-[#18181B] font-semibold">
                  Thank You, {formData.customer_name}
                </h3>
                <p className="text-xs text-[#52525B] max-w-md mx-auto leading-relaxed">
                  Your bespoke inquiry for <strong>{formData.product_name}</strong> has been logged with our Chennai atelier.
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-[11px] font-mono text-[#18181B]">
                  Reference: #{submittedData.orderId.slice(0, 8).toUpperCase()}
                </div>
              </div>

              {formData.applied_discount_code && (
                <div className="p-2.5 bg-[#7C5C8A]/10 border border-[#7C5C8A]/25 rounded text-xs text-[#18181B]">
                  🏷️ Applied code <strong>{formData.applied_discount_code}</strong>: Saved ₹{formData.discount_amount} (Final: ₹{formData.final_price})
                </div>
              )}

              <div className="p-4 bg-[#F7F7F9] border border-[#E8E8EC] rounded-sm text-left text-xs space-y-2 text-[#444]">
                <div className="flex items-center gap-2 text-[#18181B] font-semibold">
                  <MessageSquare className="w-4 h-4 text-[#7C5C8A]" />
                  <span>Final Step: Confirm via WhatsApp</span>
                </div>
                <p className="text-[#52525B]">
                  We have pre-formatted your exact measurements, applied offers, and delivery preferences into a WhatsApp message. Click below to finalize with our concierge:
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={submittedData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white font-semibold text-xs tracking-wider uppercase rounded-sm shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-current" />
                  Open WhatsApp Order Chat
                </a>
                <button
                  type="button"
                  onClick={closeInquiry}
                  className="w-full sm:w-auto px-5 py-3 border border-[#E8E8EC] text-[#18181B] hover:bg-[#F7F7F9] font-semibold text-xs tracking-wider uppercase rounded-sm transition-all"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Product Info Bar & Price Summary */}
              <div className="p-3 bg-[#F7F7F9] border border-[#E8E8EC] rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-widest text-[#71717A] uppercase block">
                    Piece Requested
                  </span>
                  <p className="font-serif text-base font-semibold text-[#18181B]">
                    {formData.product_name}
                  </p>
                </div>
                {selectedProduct && (
                  <div className="text-right">
                    {formData.applied_discount_code ? (
                      <div>
                        <span className="text-xs text-[#888] line-through font-mono block">
                          ₹{selectedProduct.price}
                        </span>
                        <span className="text-sm font-bold text-[#18181B] font-mono">
                          ₹{formData.final_price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-[#18181B] font-mono">
                        ₹{selectedProduct.price}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Promotional Discount Code Input */}
              <div className="p-3 bg-white border border-[#E8E8EC] rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#18181B] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#7C5C8A]" />
                    <span>Have a Promotional Code?</span>
                  </label>
                  {formData.applied_discount_code && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-red-600 hover:underline uppercase tracking-wider font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!formData.applied_discount_code ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WALA10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded-sm text-xs font-mono uppercase text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isVerifyingCoupon || !couponInput.trim()}
                      className="px-4 py-1.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-all disabled:opacity-50"
                    >
                      {isVerifyingCoupon ? 'Verifying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-[#18181B] bg-[#7C5C8A]/10 p-2 rounded border border-[#7C5C8A]/25">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-[#7C5C8A]" />
                      Code <strong>{formData.applied_discount_code}</strong> applied!
                    </span>
                    <span className="font-semibold text-[#7C5C8A]">
                      -₹{formData.discount_amount}
                    </span>
                  </div>
                )}

                {couponStatus && !couponStatus.valid && (
                  <p className="text-[11px] text-red-600">{couponStatus.message}</p>
                )}
              </div>

              {/* Sizing & Custom Height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#18181B]">
                      Select Size <span className="text-[#7C5C8A]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={openSizeGuide}
                      className="text-[11px] text-[#7C5C8A] hover:underline"
                    >
                      Size Chart
                    </button>
                  </div>
                  <select
                    name="selected_size"
                    value={formData.selected_size}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                  >
                    <option value="52">Size 52 (Height ~5&apos;0&quot; - 5&apos;1&quot;)</option>
                    <option value="54">Size 54 (Height ~5&apos;2&quot; - 5&apos;3&quot;)</option>
                    <option value="56">Size 56 (Height ~5&apos;4&quot; - 5&apos;5&quot;)</option>
                    <option value="58">Size 58 (Height ~5&apos;6&quot; - 5&apos;7&quot;)</option>
                    <option value="60">Size 60 (Height ~5&apos;8&quot; - 5&apos;10&quot;)</option>
                    <option value="Custom">Custom Bespoke Tailored</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] mb-1">
                    Height / Heel Preference
                  </label>
                  <input
                    type="text"
                    name="custom_height"
                    placeholder="e.g. 5'4&quot; (wears flats / low heels)"
                    value={formData.custom_height}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                  />
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] mb-1">
                    Full Name <span className="text-[#7C5C8A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="e.g. Ayesha Rahman"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] mb-1">
                    WhatsApp Phone <span className="text-[#7C5C8A]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] mb-1">
                  Email Address <span className="text-[#888] font-normal lowercase">(for receipt confirmation)</span>
                </label>
                <input
                  type="email"
                  name="customer_email"
                  placeholder="client@luxury.com"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                />
              </div>

              {/* Shipping Address & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] mb-1">
                    City <span className="text-[#7C5C8A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Chennai / Bangalore / Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] mb-1">
                    Delivery Address <span className="text-[#7C5C8A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="shipping_address"
                    required
                    placeholder="Flat 3B, Crescent Gardens, Nungambakkam, Chennai"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                  />
                </div>
              </div>

              {/* Tailoring Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] mb-1">
                  Tailoring & Customization Notes <span className="text-[#888] font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  name="custom_notes"
                  rows={2}
                  placeholder="Specific requirements: front snap buttons, matching sheila/hijab, loose sleeve cuff, expedited Chennai delivery..."
                  value={formData.custom_notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded-sm text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A] resize-none"
                />
              </div>

              <div className="p-3 bg-[#F7F7F9] border border-[#E8E8EC] rounded-sm text-[11px] text-[#52525B] leading-relaxed">
                ✨ <strong>No immediate payment required.</strong> Each piece is bespoke. Submitting this inquiry connects you directly with our Chennai atelier concierge on WhatsApp for tailoring confirmation and delivery arrangement.
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeInquiry}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider text-[#71717A] hover:text-[#18181B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white font-semibold text-xs uppercase tracking-widest rounded-sm transition-all shadow disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Processing Atelier Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit & Connect via WhatsApp
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
