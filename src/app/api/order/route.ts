import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import { sendOrderNotificationEmails } from '@/lib/resend';
import { OrderInquiryFormData } from '@/types/database';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const body: OrderInquiryFormData = {
      ...rawBody,
      applied_discount_code: rawBody.applied_discount_code || rawBody.discount_code || null,
    };

    const itemsList = body.items && body.items.length > 0 ? body.items : [];
    let productName = body.product_name;
    let selectedSize = body.selected_size;

    if (itemsList.length > 0) {
      if (!productName || productName === 'Bespoke Modest Abaya') {
        productName = itemsList.map((i) => `${i.name} (${i.size} × ${i.quantity})`).join(', ');
      }
      if (!selectedSize) {
        selectedSize = itemsList.length === 1 ? itemsList[0].size : 'Multi';
      }
    }

    if (!body.customer_name || !body.customer_phone || !productName) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields: name, phone, and items.' },
        { status: 400 }
      );
    }

    // Strict prepaid policy: reject non-prepaid orders
    if ((body.payment_method as string) === 'cod') {
      return NextResponse.json(
        {
          success: false,
          error:
            'WALA ABAYA strictly operates on a 100% prepaid policy via Razorpay UPI/cards or direct WhatsApp prepaid transfer because each piece is bespoke and handcrafted to custom measurements.',
        },
        { status: 400 }
      );
    }

    const effectivePaymentMethod = body.payment_method || 'razorpay';
    const isPaid = body.payment_status === 'paid';

    const fullAddress = [
      body.shipping_address,
      body.locality,
      body.city || 'Chennai',
      body.state,
      body.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    let orderId = crypto.randomUUID();
    let orderRecord = {
      id: orderId,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email || null,
      shipping_address: fullAddress || 'TBD on WhatsApp',
      city: body.city || 'Chennai',
      state: body.state || null,
      pincode: body.pincode || null,
      product_id: body.product_id || (itemsList[0]?.product_id) || null,
      product_name: productName,
      selected_size: selectedSize || '56',
      custom_height: body.custom_height || null,
      custom_notes: body.custom_notes || null,
      items: itemsList,
      payment_method: effectivePaymentMethod,
      payment_status: isPaid ? 'paid' : 'pending',
      razorpay_order_id: body.razorpay_order_id || null,
      razorpay_payment_id: body.razorpay_payment_id || null,
      applied_discount_code: body.applied_discount_code || null,
      discount_amount: body.discount_amount || 0,
      final_price: body.final_price || null,
      status: isPaid ? 'confirmed' : 'pending',
      created_at: new Date().toISOString(),
    };

    let customerRecord = {
      name: body.customer_name,
      phone: body.customer_phone.trim(),
      email: body.customer_email || null,
      address: fullAddress || null,
      city: body.city || 'Chennai',
      total_orders: 1,
      total_spend: isPaid ? (Number(body.final_price) || 0) : 0,
      lifecycle_stage: 'lead',
    };

    try {
      const supabase = getAdminClient();

      // 1. Insert Order
      const insertPayload: Record<string, unknown> = {
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email || null,
        shipping_address: fullAddress || 'TBD on WhatsApp',
        city: body.city || 'Chennai',
        product_id: body.product_id || (itemsList[0]?.product_id) || null,
        product_name: productName,
        selected_size: selectedSize || '56',
        custom_height: body.custom_height || null,
        custom_notes: body.custom_notes || null,
        items: itemsList,
        payment_method: effectivePaymentMethod,
        payment_status: isPaid ? 'paid' : 'pending',
        razorpay_order_id: body.razorpay_order_id || null,
        razorpay_payment_id: body.razorpay_payment_id || null,
        applied_discount_code: body.applied_discount_code || null,
        discount_amount: body.discount_amount || 0,
        final_price: body.final_price || null,
        status: isPaid ? 'confirmed' : 'pending',
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(insertPayload)
        .select()
        .single();

      if (!error && data) {
        orderId = data.id;
        orderRecord = data;
      } else if (error) {
        console.warn('[Supabase Warning] Could not save order to DB:', error.message);
        // Retry with basic columns if newer columns are missing
        const basicPayload = {
          customer_name: body.customer_name,
          customer_phone: body.customer_phone,
          customer_email: body.customer_email || null,
          shipping_address: fullAddress || 'TBD on WhatsApp',
          city: body.city || 'Chennai',
          product_id: body.product_id || null,
          product_name: productName,
          selected_size: selectedSize || '56',
          custom_height: body.custom_height || null,
          custom_notes: body.custom_notes || null,
          applied_discount_code: body.applied_discount_code || null,
          discount_amount: body.discount_amount || 0,
          final_price: body.final_price || null,
          status: 'pending',
        };
        const retry = await supabase.from('orders').insert(basicPayload).select().single();
        if (retry.data) {
          orderId = retry.data.id;
          orderRecord = retry.data;
        }
      }

      // 2. CRM Aggregation: Upsert Customer Record
      try {
        const orderSpend = Number(body.final_price) || 0;
        const cleanPhone = body.customer_phone.trim();

        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (existingCustomer) {
          const newTotalOrders = (existingCustomer.total_orders || 0) + 1;
          const newTotalSpend = (Number(existingCustomer.total_spend) || 0) + orderSpend;
          const newStage = newTotalSpend >= 15000 || newTotalOrders >= 3 ? 'vip' : 'active_client';

          const { data: updatedCustomer } = await supabase
            .from('customers')
            .update({
              name: body.customer_name,
              email: body.customer_email || existingCustomer.email,
              address: body.shipping_address || existingCustomer.address,
              city: body.city || existingCustomer.city,
              total_orders: newTotalOrders,
              total_spend: newTotalSpend,
              lifecycle_stage: newStage,
            })
            .eq('id', existingCustomer.id)
            .select()
            .single();

          if (updatedCustomer) {
            customerRecord = updatedCustomer;
          }
        } else {
          const { data: newCust } = await supabase
            .from('customers')
            .insert({
              name: body.customer_name,
              phone: cleanPhone,
              email: body.customer_email || null,
              address: body.shipping_address || null,
              city: body.city || 'Chennai',
              total_orders: 1,
              total_spend: orderSpend,
              lifecycle_stage: 'lead',
              admin_notes: `First inquiry: ${body.product_name} (${body.selected_size})`,
            })
            .select()
            .single();

          if (newCust) {
            customerRecord = newCust;
          }
        }
      } catch (crmError) {
        console.warn('[CRM Aggregation Error]:', crmError);
      }
    } catch (dbError) {
      console.warn('[Supabase Connection Exception]:', dbError);
    }

    // Trigger Resend email notification (handles missing keys safely)
    await sendOrderNotificationEmails(body, orderId);

    // Format WhatsApp Order URL
    const atelierPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919123456789';
    const whatsappUrl = generateWhatsAppOrderUrl(atelierPhone, body);

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order: orderRecord,
      customer: customerRecord,
      whatsapp_url: whatsappUrl,
      message: 'Your bespoke order inquiry has been processed successfully.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Database unavailable';
    console.error('Order API Error:', err);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
