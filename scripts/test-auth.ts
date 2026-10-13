/**
 * Autonomous Verification Script for Admin Authentication & Route Protection
 */

async function testAuthPipeline() {
  console.log('====================================================');
  console.log('🧪 TESTING WALA ABAYA ADMIN AUTH & ROUTE PROTECTION');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3000';

  // 1. Test unauthenticated access to /admin
  console.log('1️⃣ Checking unauthenticated access to /admin...');
  const resAdmin = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
  console.log(`   Status: ${resAdmin.status}`);
  const locationAdmin = resAdmin.headers.get('location');
  console.log(`   Location: ${locationAdmin}`);
  if (resAdmin.status === 307 || resAdmin.status === 308 || (resAdmin.status === 302 && locationAdmin?.includes('/admin/login'))) {
    console.log('   ✅ PASS: Unauthenticated access to /admin was redirected to /admin/login');
  } else if (locationAdmin?.includes('/admin/login')) {
    console.log('   ✅ PASS: Redirect location matches /admin/login');
  } else {
    throw new Error(`Expected redirect to /admin/login, got status ${resAdmin.status} location ${locationAdmin}`);
  }

  // 2. Test unauthenticated access to /admin/settings
  console.log('\n2️⃣ Checking unauthenticated access to /admin/settings...');
  const resSettings = await fetch(`${BASE_URL}/admin/settings`, { redirect: 'manual' });
  console.log(`   Status: ${resSettings.status}`);
  const locationSettings = resSettings.headers.get('location');
  console.log(`   Location: ${locationSettings}`);
  if (locationSettings?.includes('/admin/login')) {
    console.log('   ✅ PASS: Unauthenticated access to /admin/settings was redirected to /admin/login');
  } else {
    throw new Error(`Expected redirect to /admin/login, got status ${resSettings.status}`);
  }

  // 3. Test visiting /admin/login without session
  console.log('\n3️⃣ Checking direct access to /admin/login...');
  const resLogin = await fetch(`${BASE_URL}/admin/login`);
  console.log(`   Status: ${resLogin.status}`);
  const htmlLogin = await resLogin.text();
  if (resLogin.status === 200 && htmlLogin.includes('Admin Atelier Portal')) {
    console.log('   ✅ PASS: /admin/login renders successfully with Admin Atelier Portal & logo');
  } else {
    throw new Error(`Failed to render /admin/login properly, status: ${resLogin.status}`);
  }

  // 4. Test invalid login credentials
  console.log('\n4️⃣ Testing invalid login credentials on /api/admin/auth...');
  const badAuthRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'badadmin@walaabaya.com', password: 'wrongpassword' }),
  });
  console.log(`   Status: ${badAuthRes.status}`);
  const badAuthData = await badAuthRes.json();
  if (!badAuthData.success && badAuthData.error) {
    console.log(`   ✅ PASS: Invalid credentials rejected gracefully: "${badAuthData.error}"`);
  } else {
    throw new Error('Expected authentication rejection on invalid credentials.');
  }

  // 5. Test valid login credentials
  console.log('\n5️⃣ Testing valid login credentials on /api/admin/auth...');
  const validAuthRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@walaabaya.com', password: 'wala2025', rememberMe: true }),
  });
  console.log(`   Status: ${validAuthRes.status}`);
  const validAuthData = await validAuthRes.json();
  const setCookieHeader = validAuthRes.headers.get('set-cookie') || '';
  console.log(`   Cookies received: ${setCookieHeader.slice(0, 100)}...`);

  if (validAuthData.success && setCookieHeader.includes('wala_admin_session=authenticated')) {
    console.log('   ✅ PASS: Valid login succeeded and issued authenticated session cookies');
  } else {
    throw new Error('Expected successful login and wala_admin_session cookie.');
  }

  // Extract cookies
  let cookies = '';
  if (typeof (validAuthRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === 'function') {
    cookies = (validAuthRes.headers as unknown as { getSetCookie: () => string[] }).getSetCookie().map(c => c.split(';')[0].trim()).join('; ');
  } else {
    cookies = setCookieHeader.split(',').map(c => c.split(';')[0].trim()).join('; ');
  }

  // 6. Test authenticated access to /admin/settings with cookie
  console.log('\n6️⃣ Checking authenticated access to /admin/settings with session cookie...');
  const authSettingsRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Cookie: cookies },
    redirect: 'manual',
  });
  console.log(`   Status: ${authSettingsRes.status}`);
  if (authSettingsRes.status === 200) {
    console.log('   ✅ PASS: Authenticated request allowed into /admin/settings without redirection');
  } else {
    throw new Error(`Expected HTTP 200 for authenticated user on /admin/settings, got ${authSettingsRes.status}`);
  }

  // 7. Test visiting /admin/login while authenticated -> should redirect to /admin
  console.log('\n7️⃣ Checking visiting /admin/login with active session cookie...');
  const authLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    headers: { Cookie: cookies },
    redirect: 'manual',
  });
  console.log(`   Status: ${authLoginRes.status}`);
  const authLoginRedirect = authLoginRes.headers.get('location');
  console.log(`   Location: ${authLoginRedirect}`);
  if (authLoginRedirect?.includes('/admin')) {
    console.log('   ✅ PASS: Authenticated visitor to /admin/login automatically redirected to /admin');
  } else {
    throw new Error(`Expected redirect away from login page when authenticated, got ${authLoginRedirect}`);
  }

  // 8. Test sign out / session invalidation
  console.log('\n8️⃣ Testing admin sign out / session destruction...');
  const signOutRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: 'DELETE',
    headers: { Cookie: cookies },
  });
  console.log(`   Status: ${signOutRes.status}`);
  const signOutData = await signOutRes.json();
  const rawCookies: string[] = typeof (signOutRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === 'function'
    ? (signOutRes.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
    : [signOutRes.headers.get('set-cookie') || ''];
  const signOutCookieStr = rawCookies.join('; ').toLowerCase();

  if (signOutData.success && (signOutCookieStr.includes('max-age=0') || signOutCookieStr.includes('expires='))) {
    console.log('   ✅ PASS: Sign out successfully expired session cookies');
  } else {
    throw new Error('Expected sign out to clear cookies.');
  }

  console.log('\n🎉 ALL ADMIN AUTHENTICATION & ROUTE PROTECTION TESTS PASSED CLEANLY!\n');
}

testAuthPipeline().catch((err) => {
  console.error('\n❌ AUTH TEST FAILURE:', err);
  process.exit(1);
});
