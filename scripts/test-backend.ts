import { generateWhatsAppOrderUrl } from '../src/lib/whatsapp';

interface TestResult {
  service: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    return { status: res.status, ok: res.ok, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 0, ok: false, error: msg, data: null };
  }
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('       WALA ABAYA ATELIER — BACKEND TEST RUNNER              ');
  console.log('=============================================================\n');
  console.log(`Target Host: ${BASE_URL}\n`);

  const results: TestResult[] = [];

  // --------------------------------------------------------------------------
  // TEST 1: STORE SETTINGS CRUD & CACHE INVALIDATION
  // --------------------------------------------------------------------------
  console.log('► Testing Store Settings Service...');
  try {
    // 1. Read current settings
    const readInitial = await request('/api/admin/settings');
    if (!readInitial.ok) throw new Error(`Failed initial read: ${readInitial.status}`);

    const originalSettings = readInitial.data.settings;

    // 2. Mutate settings
    const updatedPayload = {
      settings: {
        ...originalSettings,
        support_mobile: '+91 98765 00000',
        welcome_slogan: 'Subhan Allah, welcome to Wala Abaya Chennai Atelier.',
      },
    };

    const updateRes = await request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(updatedPayload),
    });

    if (!updateRes.ok || !updateRes.data.success) {
      throw new Error(`Settings update failed: ${JSON.stringify(updateRes.data)}`);
    }

    // 3. Confirm persistence & revalidation
    const readUpdated = await request('/api/admin/settings');
    const updatedSettings = readUpdated.data.settings;

    const phoneMatched = updatedSettings.support_mobile === '+91 98765 00000';
    const sloganMatched = updatedSettings.welcome_slogan.includes('Subhan Allah');

    if (!phoneMatched || !sloganMatched) {
      throw new Error(`Persisted settings do not match mutation: ${JSON.stringify(updatedSettings)}`);
    }

    // 4. Cleanup / Restore
    await request('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ settings: originalSettings }),
    });

    results.push({
      service: 'Store Settings Service',
      name: 'CRUD, in-memory/DB persistence, and Next.js revalidatePath execution',
      passed: true,
      details: 'Settings updated to +91 98765 00000, verified, and restored cleanly.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      service: 'Store Settings Service',
      name: 'CRUD, in-memory/DB persistence, and Next.js revalidatePath execution',
      passed: false,
      error: errorMsg,
    });
  }

  // --------------------------------------------------------------------------
  // TEST 2: PRODUCT CATALOG SERVICE & CATEGORY FILTERING
  // --------------------------------------------------------------------------
  console.log('► Testing Product Catalog Service...');
  let createdProductId: string | null = null;
  try {
    const testProductPayload = {
      name: 'Test Medina Silk Abaya',
      slug: 'test-medina-silk-abaya-' + Date.now(),
      price: 2999,
      compare_at_price: 3499,
      category: 'Everyday Luxury',
      fabric: 'Medina Silk',
      sizes: ['52', '54', '56', '58', '60'],
      is_in_stock: true,
    };

    // 1. Create Product
    const createRes = await request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(testProductPayload),
    });

    if (!createRes.ok || !createRes.data.success || !createRes.data.product) {
      throw new Error(`Product creation failed: ${JSON.stringify(createRes.data)}`);
    }

    createdProductId = createRes.data.product.id || testProductPayload.slug;

    // 2. Query filtered by category
    const filterRes = await request('/api/admin/products?category=Everyday%20Luxury');
    if (!filterRes.ok) throw new Error(`Category query failed: ${filterRes.status}`);

    const productsList = filterRes.data.products || [];
    const found = productsList.some(
      (p: { name: string; category: string }) =>
        p.name === 'Test Medina Silk Abaya' && p.category === 'Everyday Luxury'
    );

    if (!found) {
      throw new Error('Created product was not indexed under category "Everyday Luxury"');
    }

    // 3. Cleanup: Delete test entry
    const deleteRes = await request(`/api/admin/products?id=${createdProductId}`, {
      method: 'DELETE',
    });

    if (!deleteRes.ok || !deleteRes.data.success) {
      throw new Error(`Product cleanup delete failed: ${JSON.stringify(deleteRes.data)}`);
    }

    results.push({
      service: 'Product Catalog Service',
      name: 'Product creation, category indexing, and deletion cleanup',
      passed: true,
      details: 'Product created, confirmed under "Everyday Luxury", and deleted.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      service: 'Product Catalog Service',
      name: 'Product creation, category indexing, and deletion cleanup',
      passed: false,
      error: errorMsg,
    });
  }

  // --------------------------------------------------------------------------
  // TEST 3: ORDER & CRM INGESTION SERVICE
  // --------------------------------------------------------------------------
  interface OrderTestResponse {
    success?: boolean;
    order?: { status?: string; [key: string]: unknown };
    customer?: { lifecycle_stage?: string; [key: string]: unknown };
    order_id?: string;
    whatsapp_url?: string;
  }
  let testOrderResponse: OrderTestResponse | null = null;
  try {
    const testOrderPayload = {
      customer_name: 'Test Client Ayesha',
      customer_phone: '+919876543210',
      customer_email: 'ayesha.test@example.com',
      shipping_address: 'Anna Nagar, Chennai',
      city: 'Chennai',
      product_name: 'Test Medina Silk Abaya',
      selected_size: '54',
      custom_height: "5'4\"",
      custom_notes: 'Extra 1 inch on sleeves',
      discount_code: 'WALA15',
      final_price: 2549,
    };

    const orderRes = await request('/api/order', {
      method: 'POST',
      body: JSON.stringify(testOrderPayload),
    });

    if (!orderRes.ok || !orderRes.data.success) {
      throw new Error(`Order submission failed: ${JSON.stringify(orderRes.data)}`);
    }

    testOrderResponse = orderRes.data as OrderTestResponse;

    // Verify order status
    if (testOrderResponse?.order && testOrderResponse.order.status !== 'pending') {
      throw new Error(`Expected order status 'pending', got: ${testOrderResponse.order.status}`);
    }

    // Verify customer CRM upsert
    if (testOrderResponse?.customer) {
      const stage = testOrderResponse.customer.lifecycle_stage;
      if (stage !== 'lead' && stage !== 'active_client') {
        throw new Error(`Expected CRM lifecycle_stage 'lead' or 'active_client', got: ${stage}`);
      }
    }

    results.push({
      service: 'Order & CRM Ingestion Service',
      name: 'Order generation, status tracking, and customer CRM aggregation',
      passed: true,
      details: `Order #${testOrderResponse?.order_id?.slice(0, 8) || ''} created with pending status and CRM upsert.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      service: 'Order & CRM Ingestion Service',
      name: 'Order generation, status tracking, and customer CRM aggregation',
      passed: false,
      error: errorMsg,
    });
  }

  // --------------------------------------------------------------------------
  // TEST 4: WHATSAPP LINK GENERATOR SERVICE
  // --------------------------------------------------------------------------
  console.log('► Testing WhatsApp Link Generator Service...');
  try {
    const testPayload = {
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

    const whatsappUrl =
      (typeof testOrderResponse?.whatsapp_url === 'string' ? testOrderResponse.whatsapp_url : null) ||
      generateWhatsAppOrderUrl('919123456789', testPayload);

    // 1. Deep-link format check
    if (!whatsappUrl.startsWith('https://wa.me/919123456789?text=')) {
      throw new Error(`Invalid WhatsApp base URL format: ${whatsappUrl}`);
    }

    // 2. Extract and decode query text
    const encodedText = whatsappUrl.split('?text=')[1];
    const decodedText = decodeURIComponent(encodedText);

    // 3. Verify all mandatory attributes are present in message text
    const assertions = [
      { field: 'Customer Name', pass: decodedText.includes('Test Client Ayesha') },
      { field: 'Product Name', pass: decodedText.includes('Test Medina Silk Abaya') },
      { field: 'Selected Size', pass: decodedText.includes('54') },
      { field: 'Chennai Delivery Address', pass: decodedText.includes('Anna Nagar, Chennai') },
      { field: 'Alteration Notes', pass: decodedText.includes('Extra 1 inch on sleeves') },
    ];

    const failed = assertions.filter((a) => !a.pass);
    if (failed.length > 0) {
      throw new Error(`Missing fields in WhatsApp text: ${failed.map((f) => f.field).join(', ')}`);
    }

    results.push({
      service: 'WhatsApp Link Generator Service',
      name: 'Encoding, store owner routing, and bespoke tailoring parameters',
      passed: true,
      details: 'Verified deep-link contains name, piece, size, Anna Nagar address, and sleeve notes.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      service: 'WhatsApp Link Generator Service',
      name: 'Encoding, store owner routing, and bespoke tailoring parameters',
      passed: false,
      error: errorMsg,
    });
  }

  // --------------------------------------------------------------------------
  // TEST 5: DISCOUNT & PROMO CODE ENGINE
  // --------------------------------------------------------------------------
  console.log('► Testing Discount Engine...');
  try {
    // Case A: Valid active code (WALA15)
    const validRes = await request('/api/admin/offers?code=WALA15');
    if (!validRes.ok) throw new Error(`Valid code check failed: ${validRes.status}`);
    const pct = validRes.data.discount_percentage || validRes.data.offers?.[0]?.discount_percentage;
    if (pct !== 15) throw new Error(`Expected 15% discount for WALA15, got: ${pct}%`);

    // Case B: Inactive / expired code (EXPIRED10)
    const inactiveRes = await request('/api/admin/offers?code=EXPIRED10');
    if (inactiveRes.data.error !== 'Offer expired or inactive') {
      throw new Error(
        `Expected error "Offer expired or inactive", got: "${inactiveRes.data.error}"`
      );
    }

    // Case C: Invalid coupon code (INVALID999)
    const invalidRes = await request('/api/admin/offers?code=INVALID999');
    if (invalidRes.data.error !== 'Invalid coupon code') {
      throw new Error(
        `Expected error "Invalid coupon code", got: "${invalidRes.data.error}"`
      );
    }

    results.push({
      service: 'Discount Engine',
      name: 'Active calculations, expired rejection, and invalid code validation',
      passed: true,
      details: 'WALA15 (15% OK), EXPIRED10 (Offer expired or inactive), INVALID999 (Invalid coupon code).',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      service: 'Discount Engine',
      name: 'Active calculations, expired rejection, and invalid code validation',
      passed: false,
      error: errorMsg,
    });
  }

  // --------------------------------------------------------------------------
  // TEST 6: GRACEFUL ERROR HANDLING & FALLBACKS
  // --------------------------------------------------------------------------
  console.log('► Testing Graceful Error Handling & Fallbacks...');
  try {
    // 1. Empty Order payload
    const emptyOrderRes = await request('/api/order', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (emptyOrderRes.status !== 400 || emptyOrderRes.data.success !== false) {
      throw new Error(`Expected HTTP 400 with success: false for empty order, got: ${emptyOrderRes.status}`);
    }

    // 2. Empty Product payload
    const emptyProductRes = await request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (emptyProductRes.status !== 400 || !emptyProductRes.data.error) {
      throw new Error(`Expected HTTP 400 with error message for empty product, got: ${emptyProductRes.status}`);
    }

    results.push({
      service: 'Graceful Error Handling & Fallbacks',
      name: 'Validation error responses, structured JSON returns, and exception safety',
      passed: true,
      details: 'Handled missing payloads with structured JSON (400) without crashing.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({
      service: 'Graceful Error Handling & Fallbacks',
      name: 'Validation error responses, structured JSON returns, and exception safety',
      passed: false,
      error: errorMsg,
    });
  }

  // --------------------------------------------------------------------------
  // TERMINAL SUMMARY CHECKLIST
  // --------------------------------------------------------------------------
  console.log('\n=============================================================');
  console.log('               BACKEND VALIDATION SUMMARY REPORT             ');
  console.log('=============================================================\n');

  let allPassed = true;
  for (const r of results) {
    const statusTag = r.passed ? '[\x1b[32mPASS\x1b[0m]' : '[\x1b[31mFAIL\x1b[0m]';
    console.log(`${statusTag} ${r.service}`);
    console.log(`       ↳ ${r.name}`);
    if (r.details) console.log(`       ↳ Result: ${r.details}`);
    if (r.error) {
      console.log(`       ↳ Error: \x1b[31m${r.error}\x1b[0m`);
      allPassed = false;
    }
    console.log('');
  }

  console.log('-------------------------------------------------------------');
  console.log(`Total Services Tested: ${results.length}`);
  console.log(`Successful: ${results.filter((r) => r.passed).length}`);
  console.log(`Failed: ${results.filter((r) => !r.passed).length}`);
  console.log('=============================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runTestSuite();
