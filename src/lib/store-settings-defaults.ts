export const STORE_SETTINGS_DEFAULTS = {
  logo_url: '/logo.png',
  business_name: 'WALA ABAYA',
  support_mobile: '+91 91234 56789',
  support_email: 'support@walaabaya.com',
  business_address: 'Chennai, India',
  welcome_slogan:
    "Assalamu Alaikum, welcome to WALA ABAYA, Chennai's Bespoke Abaya Atelier. Experience elegance in every thread. Subhan Allah!",
  razorpay_key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_WalaAbayaChennai',
  atelier_title: 'CHENNAI ATELIER',
  atelier_address: 'Nungambakkam High Road, Chennai, Tamil Nadu 600034',
  atelier_phone: '+91 44 2800 WALA',
  atelier_email: 'concierge@walaabaya.com',
  atelier_hours: 'Mon - Sat: 10:30 AM - 8:30 PM IST',
};

export type StorefrontSettings = typeof STORE_SETTINGS_DEFAULTS & Record<string, string>;
