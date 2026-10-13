async function runTests() {
  const baseUrl = 'http://localhost:3000';
  const results = [];

  async function check(name, url, options = {}) {
    try {
      const res = await fetch(url, options);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();
      const pass = res.ok;
      results.push({ name, status: res.status, pass, preview: isJson ? JSON.stringify(data).slice(0, 100) : data.slice(0, 100) });
      console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} -> HTTP ${res.status}`);
      return data;
    } catch (err) {
      results.push({ name, status: 'ERROR', pass: false, preview: String(err) });
      console.log(`[ERROR] ${name} -> ${err}`);
      return null;
    }
  }

  console.log('--- STARTING COMPREHENSIVE ENDPOINT VERIFICATION ---');

  // 1. Storefront Home
  await check('Storefront Home (/)', `${baseUrl}/`);

  // 2. Admin Settings Page
  await check('Admin Settings Page (/admin/settings)', `${baseUrl}/admin/settings`);

  // 3. Admin Index Page
  await check('Admin Index Page (/admin)', `${baseUrl}/admin`);

  // 4. Settings API GET
  await check('Settings API (GET /api/admin/settings)', `${baseUrl}/api/admin/settings`);

  // 5. Settings API POST
  await check('Settings API (POST /api/admin/settings)', `${baseUrl}/api/admin/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      settings: {
        business_name: 'WALA ABAYA',
        support_mobile: '+91 91234 56789',
        support_email: 'support@walaabaya.com',
        business_address: 'Chennai, India',
        welcome_slogan: "Assalamu Alaikum, welcome to WALA ABAYA, Chennai's Bespoke Abaya Atelier.",
      },
    }),
  });

  // 6. Offer Engine Banner
  await check('Offer Banner (GET /api/admin/offers?banner=true)', `${baseUrl}/api/admin/offers?banner=true`);

  // 7. Offer Engine Coupon Code Validation
  await check('Offer Coupon Code (GET /api/admin/offers?code=WALA15)', `${baseUrl}/api/admin/offers?code=WALA15`);

  // 8. Products API GET
  await check('Products Catalog (GET /api/admin/products)', `${baseUrl}/api/admin/products`);

  // 9. Products API POST (Add Product)
  await check('Add Product (POST /api/admin/products)', `${baseUrl}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Oud Silk Luxury Abaya',
      price: 5200,
      compare_at_price: 6500,
      category: 'Silk',
      fabric: 'Pure Japanese Nida',
      description: 'Hand-tailored in Chennai with pure silk crepe piping.',
      images: ['/logo.svg'],
      sizes: ['52', '54', '56', '58', '60'],
      is_in_stock: true,
    }),
  });

  // 10. Order Submission & WhatsApp URL Generator
  const orderData = await check('Order Submission (POST /api/order)', `${baseUrl}/api/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Fatima Zohra',
      customer_phone: '+91 98401 23456',
      customer_email: 'fatima@example.com',
      shipping_address: 'Flat 4B, Harrington Road, Chetpet, Chennai',
      city: 'Chennai',
      product_name: 'Classic Noir Crepe Abaya',
      selected_size: '56',
      custom_height: '5\'4" wearing modest flats',
      applied_discount_code: 'WALA15',
      discount_amount: 675,
      final_price: 3825,
      custom_notes: 'Matching pure silk sheila with discreet snap buttons please.',
    }),
  });

  if (orderData && orderData.whatsapp_url) {
    console.log('\n[WhatsApp URL Verified]:');
    console.log(orderData.whatsapp_url);
  }

  // 11. CRM Customers API
  await check('CRM Customers List (GET /api/admin/customers)', `${baseUrl}/api/admin/customers`);

  // 12. Orders API GET
  await check('Orders List (GET /api/admin/orders)', `${baseUrl}/api/admin/orders`);

  console.log('\n--- VERIFICATION COMPLETED SUMMARY ---');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.pass).length}`);
  console.log(`Failed: ${results.filter(r => !r.pass).length}`);
}

runTests();
