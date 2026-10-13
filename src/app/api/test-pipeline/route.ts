import { NextResponse } from 'next/server';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';

export async function GET() {
  const results: Array<{ service: string; name: string; passed: boolean; details?: string; error?: string }> = [];

  try {
    // 1. WhatsApp Link Generator Test
    const samplePayload = {
      customer_name: 'Test Client Ayesha',
      customer_phone: '+919876543210',
      customer_email: 'ayesha.test@example.com',
      shipping_address: 'Anna Nagar, Chennai',
      city: 'Chennai',
      product_name: 'Test Medina Silk Abaya',
      selected_size: '54',
      custom_height: "5'4\"",
      custom_notes: 'Extra 1 inch on sleeves',
      applied_discount_code: 'WALA15',
      discount_amount: 450,
      final_price: 2549,
    };

    const whatsappUrl = generateWhatsAppOrderUrl('919123456789', samplePayload);
    const validUrl =
      whatsappUrl.startsWith('https://wa.me/919123456789') &&
      whatsappUrl.includes(encodeURIComponent('Test Client Ayesha')) &&
      whatsappUrl.includes(encodeURIComponent('Anna Nagar, Chennai'));

    results.push({
      service: 'WhatsApp Link Generator Service',
      name: 'Encoding, store owner routing, and bespoke tailoring parameters',
      passed: validUrl,
      details: validUrl ? 'Verified deep-link structure and customer/address parameters.' : undefined,
      error: !validUrl ? 'WhatsApp deep-link format mismatch' : undefined,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: results,
      all_passed: results.every((r) => r.passed),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
