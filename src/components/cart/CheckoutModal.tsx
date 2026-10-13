'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import {
  X,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { OrderItem } from '@/types/database';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  prefill: {
    name: string;
    email?: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void | Promise<void>;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const INDIAN_STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Bihar',
  'Punjab',
  'Haryana',
  'Jammu and Kashmir',
  'Goa',
  'Assam',
  'Odisha',
  'Uttarakhand',
  'Jharkhand',
  'Chhattisgarh',
  'Himachal Pradesh',
  'Chandigarh',
  'Puducherry',
  'Tripura',
  'Meghalaya',
  'Manipur',
  'Nagaland',
  'Mizoram',
  'Sikkim',
  'Arunachal Pradesh',
  'Ladakh',
  'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
];

export default function CheckoutModal() {
  const {
    checkoutItems,
    isCheckoutOpen,
    closeCheckout,
    appliedPromo,
    discountAmount,
    clearCart,
  } = useCart();

  // Pan-India Delivery Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    locality: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    deliveryNotes: '',
  });

  // Strict Prepaid-Only Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'whatsapp'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    whatsappUrl: string;
    totalAmount: number;
    itemsCount: number;
    paymentMethod: string;
  } | null>(null);

  if (!isCheckoutOpen) return null;

  // Calculate Subtotal & Final Total for the items in checkout
  const subtotal = checkoutItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const effectiveDiscount = appliedPromo && subtotal > 0
    ? Math.round((subtotal * appliedPromo.discount_percentage) / 100)
    : discountAmount;
  const finalTotal = Math.max(0, subtotal - effectiveDiscount);

  // Format order items
  const orderItemsPayload: OrderItem[] = checkoutItems.map((item) => ({
    product_id: item.productId,
    name: item.name,
    slug: item.slug,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
    notes: item.customAlterationNotes,
  }));

  // Dynamic Razorpay Script Loader
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit & Process Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Please fill in your name, contact phone, and full delivery address.');
      return;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      setErrorMessage('Please provide a valid 6-digit Indian PIN code.');
      return;
    }

    if (checkoutItems.length === 0) {
      setErrorMessage('Your bag is currently empty.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Base Order in Backend
      const orderPayload = {
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        customer_email: formData.email.trim() || undefined,
        shipping_address: formData.address.trim(),
        locality: formData.locality.trim() || undefined,
        city: formData.city.trim() || 'Chennai',
        state: formData.state.trim() || 'Tamil Nadu',
        pincode: formData.pincode.trim() || undefined,
        custom_notes: formData.deliveryNotes.trim() || undefined,
        items: orderItemsPayload,
        applied_discount_code: appliedPromo?.code || undefined,
        discount_amount: effectiveDiscount,
        final_price: finalTotal,
        payment_method: paymentMethod,
      };

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize order.');
      }

      const createdOrderId = orderData.order_id;
      const initialWhatsAppUrl = orderData.whatsapp_url;

      // 2. If Payment is Razorpay
      if (paymentMethod === 'razorpay') {
        const rzpLoaded = await loadRazorpayScript();

        // Call Razorpay Order Creation Endpoint
        const rzpRes = await fetch('/api/order/razorpay/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            receipt: createdOrderId,
            customer: {
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
            },
          }),
        });

        const rzpOrderData = await rzpRes.json();
        if (!rzpRes.ok || !rzpOrderData.success) {
          throw new Error(rzpOrderData.error || 'Failed to initialize payment gateway.');
        }

        // If Razorpay SDK loaded and not running in simulated sandbox mode
        if (rzpLoaded && window.Razorpay && !rzpOrderData.isSimulated) {
          const options: RazorpayOptions = {
            key: rzpOrderData.keyId,
            amount: rzpOrderData.amount,
            currency: 'INR',
            name: 'WALA ABAYA ATELIER',
            description: `Bespoke Pan-India Order #${createdOrderId.slice(0, 8)}`,
            image: '/logo.png',
            order_id: rzpOrderData.orderId,
            prefill: {
              name: formData.name,
              email: formData.email || undefined,
              contact: formData.phone,
            },
            theme: {
              color: '#7C5C8A',
            },
            handler: async function (response: RazorpayResponse) {
              try {
                await fetch('/api/order/razorpay/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    order_id: createdOrderId,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
              } catch (verifyErr) {
                console.warn('Payment verification network warning:', verifyErr);
              }

              clearCart();
              setConfirmedOrder({
                orderId: createdOrderId,
                whatsappUrl: initialWhatsAppUrl,
                totalAmount: finalTotal,
                itemsCount: checkoutItems.length,
                paymentMethod: 'Instant Online via Razorpay (PAID)',
              });
              setIsProcessing(false);
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const rzpInstance = new window.Razorpay(options);
          rzpInstance.open();
          return;
        } else {
          // Simulated Sandbox Verification Handler (for local testing without keys)
          await fetch('/api/order/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: createdOrderId,
              razorpay_order_id: rzpOrderData.orderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              is_simulated: true,
            }),
          });

          clearCart();
          setConfirmedOrder({
            orderId: createdOrderId,
            whatsappUrl: initialWhatsAppUrl,
            totalAmount: finalTotal,
            itemsCount: checkoutItems.length,
            paymentMethod: 'Instant Online via Razorpay (PAID)',
          });
          setIsProcessing(false);
          return;
        }
      }

      // 3. If Payment is Direct WhatsApp Prepaid Transfer
      clearCart();
      setConfirmedOrder({
        orderId: createdOrderId,
        whatsappUrl: initialWhatsAppUrl,
        totalAmount: finalTotal,
        itemsCount: checkoutItems.length,
        paymentMethod: 'Direct WhatsApp Prepaid Transfer (Verification Pending)',
      });
      setIsProcessing(false);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred during checkout. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-[#FFFFFF] border border-[#E8E8EC] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================================================================== */}
        {/* CELEBRATION MODAL ON SUCCESS */}
        {/* ==================================================================== */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#7C5C8A]">
                Subhan Allah • Atelier Confirmation
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#18181B]">
                Alhamdulillah, Your Order is Confirmed!
              </h2>
              <p className="text-xs text-[#71717A] max-w-md mx-auto leading-relaxed">
                Thank you for entrusting Wala Abaya Atelier. Your bespoke pieces are scheduled for tailoring and express all-India dispatch.
              </p>
            </div>

            {/* Order Summary Receipt Box */}
            <div className="p-4 bg-[#F7F7F9] border border-[#E8E8EC] rounded-lg text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E8EC]">
                <span className="text-[#71717A]">Order Reference:</span>
                <span className="font-mono font-bold text-[#18181B]">
                  #{confirmedOrder.orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Total Amount:</span>
                <span className="font-mono font-bold text-[#7C5C8A]">
                  ₹{confirmedOrder.totalAmount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Payment Policy:</span>
                <span className="font-semibold text-emerald-700">
                  100% Prepaid Confirmed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Destination:</span>
                <span className="font-medium text-[#18181B] truncate max-w-[200px]">
                  {formData.city}, {formData.state} - {formData.pincode}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <a
                href={confirmedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-widest font-semibold rounded-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Receipt</span>
              </a>

              <button
                type="button"
                onClick={closeCheckout}
                className="w-full sm:w-auto px-6 py-3 border border-[#E8E8EC] hover:bg-[#F7F7F9] text-[#18181B] text-xs uppercase tracking-widest font-semibold rounded-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* REGULAR CHECKOUT FORM */
          /* ==================================================================== */
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E8E8EC] flex items-center justify-between bg-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#7C5C8A]/10 text-[#7C5C8A] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#18181B]">
                    Atelier Pan-India Checkout
                  </h3>
                  <span className="text-[10px] text-[#71717A] tracking-wider uppercase">
                    100% Prepaid • Express All-India Doorstep Dispatch
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Itemized Order Review */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-semibold text-[#18181B] uppercase tracking-wider text-[11px]">
                    Pieces in Order ({checkoutItems.length})
                  </h4>
                  <span className="font-mono text-xs font-bold text-[#7C5C8A]">
                    Total: ₹{finalTotal}
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-[#F7F7F9] rounded-lg border border-[#E8E8EC]">
                  {checkoutItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex items-center justify-between gap-3 text-xs bg-white p-2 rounded border border-[#E8E8EC]/80"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-10 rounded bg-[#F7F7F9] overflow-hidden border border-[#E8E8EC] shrink-0">
                          <Image
                            src={item.image || '/logo.png'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#18181B] truncate">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-[#71717A]">
                            Size {item.size} • Qty {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#18181B] shrink-0">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Customer & Pan-India Delivery Coordinates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#18181B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#7C5C8A]" />
                    <span>Client & Pan-India Delivery Coordinates</span>
                  </h4>
                </div>

                {/* Shipping Delivery SLA Banner */}
                <div className="flex items-center gap-2 p-2.5 bg-purple-50/70 border border-[#7C5C8A]/20 rounded-md text-[11px] text-[#7C5C8A]">
                  <Truck className="w-4 h-4 shrink-0 text-[#7C5C8A]" />
                  <span className="font-medium">Standard All-India Express Delivery (3–5 business days)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Fatima Zahra"
                      value={formData.name}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. +91 98400 12345"
                      value={formData.phone}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. fatima@example.com"
                      value={formData.email}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Chennai, Bengaluru, Mumbai, Delhi"
                      value={formData.city}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                    Street Address & Landmark *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Flat/House No., Building Name, Street & Landmark"
                    value={formData.address}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                      Locality / Area
                    </label>
                    <input
                      type="text"
                      name="locality"
                      placeholder="e.g. Indiranagar / Anna Nagar"
                      value={formData.locality}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A] font-medium"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="e.g. 600034"
                      value={formData.pincode}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs font-mono focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#18181B] mb-1">
                    Bespoke Tailoring Requests / Height Notes
                  </label>
                  <textarea
                    rows={2}
                    name="deliveryNotes"
                    placeholder="e.g. Please alter length to 55 inches, height is 5'4, extra modest sleeve cuff"
                    value={formData.deliveryNotes}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A] resize-none"
                  />
                </div>
              </div>

              {/* 3. Strict Prepaid Policy Notice */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-950 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-900">
                  <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                  <span>100% Prepaid Orders Only</span>
                </div>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  Each abaya is custom tailored to your height and measurements; crafting begins upon payment confirmation.
                </p>
              </div>

              {/* 4. Prepaid Payment Method Selection */}
              <div className="space-y-3 pt-2 border-t border-[#E8E8EC]">
                <h4 className="font-semibold text-[#18181B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#7C5C8A]" />
                  <span>Choose Prepaid Payment Method</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Razorpay Online */}
                  <label
                    className={`relative p-3.5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#7C5C8A] bg-[#7C5C8A]/5 shadow-sm'
                        : 'border-[#E8E8EC] hover:border-[#7C5C8A]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="razorpay"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="text-[#7C5C8A] focus:ring-[#7C5C8A]"
                        />
                        <span className="font-bold text-xs text-[#18181B]">
                          Pay Online (Razorpay)
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-[#7C5C8A] text-white rounded">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] pl-5 leading-relaxed">
                      Instant confirmation via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or NetBanking.
                    </p>
                  </label>

                  {/* Option B: Direct WhatsApp Prepaid Transfer */}
                  <label
                    className={`relative p-3.5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      paymentMethod === 'whatsapp'
                        ? 'border-[#7C5C8A] bg-[#7C5C8A]/5 shadow-sm'
                        : 'border-[#E8E8EC] hover:border-[#7C5C8A]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="whatsapp"
                          checked={paymentMethod === 'whatsapp'}
                          onChange={() => setPaymentMethod('whatsapp')}
                          className="text-[#7C5C8A] focus:ring-[#7C5C8A]"
                        />
                        <span className="font-bold text-xs text-[#18181B]">
                          Direct WhatsApp Transfer
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-[#18181B] text-white rounded">
                        Concierge
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] pl-5 leading-relaxed">
                      Manual UPI / Bank transfer with instant payment receipt verification on WhatsApp concierge.
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-[#E8E8EC] space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#7C5C8A] hover:bg-[#6A4A78] disabled:opacity-60 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{finalTotal} Online with Razorpay</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Initiate Prepaid Transfer on WhatsApp (₹{finalTotal})</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-[#71717A]">
                  Protected by 256-bit encrypted checkout • Strictly 100% Prepaid Orders Only
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
