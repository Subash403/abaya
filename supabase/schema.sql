-- ====================================================================
-- WALA ABAYA ATELIER — Complete Database Schema & Migration
-- ====================================================================

-- 1. Create Offers / Announcements / Discount Codes Table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    code TEXT UNIQUE,
    discount_percentage NUMERIC NOT NULL,
    banner_text TEXT,
    is_active BOOLEAN DEFAULT true,
    show_in_banner BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_offers_code ON public.offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active);

-- 2. Create CRM Customers Table (Aggregated from Orders)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    total_orders INTEGER DEFAULT 1,
    total_spend NUMERIC DEFAULT 0,
    lifecycle_stage TEXT DEFAULT 'lead',
    admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_lifecycle ON public.customers(lifecycle_stage);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    active_discount_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    fabric TEXT NOT NULL,
    description TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    sizes TEXT[] NOT NULL DEFAULT '{"52","54","56","58","60"}',
    is_in_stock BOOLEAN NOT NULL DEFAULT true
);

-- Ensure columns exist if products table was created earlier
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS active_discount_id UUID REFERENCES public.offers(id) ON DELETE SET NULL;

-- Index for faster category and slug lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    selected_size TEXT NOT NULL,
    custom_height TEXT,
    custom_notes TEXT,
    applied_discount_code TEXT,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    final_price NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'pending'
);

-- Ensure columns exist if orders table was created earlier
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS applied_discount_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Index for ordering and filtering status
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 5. Create Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default Logo URL (Only insert if not present)
INSERT INTO public.store_settings (key, value)
VALUES ('logo_url', '/logo.svg')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.store_settings (key, value)
VALUES
    ('atelier_title', 'CHENNAI ATELIER'),
    ('atelier_address', 'Nungambakkam High Road, Chennai, Tamil Nadu 600034'),
    ('atelier_phone', '+91 44 2800 WALA'),
    ('atelier_email', 'concierge@walaabaya.com'),
    ('atelier_hours', 'Mon - Sat: 10:30 AM - 8:30 PM IST')
ON CONFLICT (key) DO NOTHING;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for Products
CREATE POLICY "Public can view products"
ON public.products FOR SELECT TO public USING (true);

CREATE POLICY "Admin can insert products"
ON public.products FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admin can update products"
ON public.products FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Admin can delete products"
ON public.products FOR DELETE TO public USING (true);

-- 8. RLS Policies for Orders
CREATE POLICY "Public can submit order inquiry"
ON public.orders FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admin can select orders"
ON public.orders FOR SELECT TO public USING (true);

CREATE POLICY "Admin can update orders"
ON public.orders FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 9. RLS Policies for Store Settings
CREATE POLICY "Public can read store settings"
ON public.store_settings FOR SELECT TO public USING (true);

CREATE POLICY "Admin can update store settings"
ON public.store_settings FOR ALL TO public USING (true) WITH CHECK (true);

-- 10. RLS Policies for Offers
CREATE POLICY "Public can read active offers"
ON public.offers FOR SELECT TO public USING (true);

CREATE POLICY "Admin can manage offers"
ON public.offers FOR ALL TO public USING (true) WITH CHECK (true);

-- 11. RLS Policies for Customers CRM
CREATE POLICY "Admin can read and manage customers"
ON public.customers FOR ALL TO public USING (true) WITH CHECK (true);

-- 12. Storage Buckets (Execute in Supabase SQL Editor if storage schema exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Access Products Bucket"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'products');

CREATE POLICY "Upload Access Products Bucket"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public Access Branding Bucket"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'branding');

CREATE POLICY "Upload Access Branding Bucket"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'branding');
