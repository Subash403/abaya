import { Order, OrderInquiryFormData } from '@/types/database';

/**
 * Normalizes phone numbers by stripping non-numeric characters (except leading +)
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Generates an encrypted/encoded WhatsApp URL for the customer to send their order to the atelier
 */
export function generateWhatsAppOrderUrl(
  atelierPhone: string,
  orderData: OrderInquiryFormData | Order
): string {
  const cleanPhone = normalizePhoneNumber(
    atelierPhone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'
  );

  const lines = [
    '✨ *WALA ABAYA — BESPOKE ORDER CONFIRMATION* ✨',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  if (orderData.items && orderData.items.length > 0) {
    lines.push(`📦 *ORDERED PIECES (${orderData.items.length} items):*`);
    orderData.items.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. *${item.name}* (Size: ${item.size}) × ${item.quantity} — ₹${item.price * item.quantity}`
      );
      if (item.notes) {
        lines.push(`   _Tailoring Note:_ ${item.notes}`);
      }
    });
  } else {
    lines.push(`👑 *Piece:* ${orderData.product_name}`);
    lines.push(`📏 *Selected Size:* ${orderData.selected_size}`);
    if (orderData.custom_height) {
      lines.push(`📐 *Custom Height / Measurements:* ${orderData.custom_height}`);
    }
    if (orderData.custom_notes) {
      lines.push(`✍️ *Tailoring Notes:* ${orderData.custom_notes}`);
    }
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (orderData.applied_discount_code) {
    lines.push(`🏷️ *Promo Code:* ${orderData.applied_discount_code} (-₹${orderData.discount_amount || 0})`);
  }
  if (orderData.final_price) {
    lines.push(`💰 *Total Amount:* ₹${orderData.final_price}`);
  }

  const paymentMethodLabel =
    orderData.payment_method === 'razorpay'
      ? '✅ PAID Online via Razorpay (UPI / Cards / NetBanking)'
      : '📱 Direct WhatsApp Prepaid Transfer (Awaiting Verification Slip)';
  lines.push(`💳 *Payment:* ${paymentMethodLabel}`);

  lines.push('');
  lines.push('*CLIENT & DELIVERY COORDINATES:*');
  lines.push(`• *Name:* ${orderData.customer_name}`);
  lines.push(`• *Phone:* ${orderData.customer_phone}`);
  if (orderData.customer_email) {
    lines.push(`• *Email:* ${orderData.customer_email}`);
  }
  lines.push(`• *City:* ${orderData.city}`);
  if ('state' in orderData && orderData.state) {
    lines.push(`• *State:* ${orderData.state}`);
  }
  lines.push(`• *Delivery Address:* ${orderData.shipping_address}`);
  if ('locality' in orderData && orderData.locality) {
    lines.push(`• *Locality / Area:* ${orderData.locality}`);
  }
  if ('pincode' in orderData && orderData.pincode) {
    lines.push(`• *Pincode:* ${orderData.pincode}`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('_Alhamdulillah! Handcrafted with dignity at Wala Abaya Atelier, Chennai. Awaiting tailoring dispatch schedule._');

  const messageText = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Generates a direct WhatsApp reply URL for the Atelier admin to contact the client
 */
export function generateWhatsAppReplyUrl(order: Order): string {
  const cleanCustomerPhone = normalizePhoneNumber(order.customer_phone);

  const lines = [
    `✨ *WALA ABAYA — ATELIER CONCIERGE* ✨`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Salam / Greetings ${order.customer_name},`,
    ``,
    `Thank you for your bespoke inquiry with Wala Abaya for *${order.product_name}* (Size: ${order.selected_size}).`,
    ``,
    `Order Reference: #${order.id ? order.id.slice(0, 8).toUpperCase() : 'PENDING'}`,
    `Status: *${order.status.toUpperCase()}*`,
  ];

  if (order.applied_discount_code) {
    lines.push(`Applied Offer: *${order.applied_discount_code}* (Est. ₹${order.final_price || 'N/A'})`);
  }

  lines.push(``);
  lines.push(`We are delighted to confirm your tailoring specifications and arrange express delivery in Chennai or nationwide courier.`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Wala Abaya Atelier • Bespoke Modest Couture, Chennai_`);

  const messageText = lines.join('\n');
  return `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(messageText)}`;
}
