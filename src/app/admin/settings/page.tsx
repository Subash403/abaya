'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Sliders,
  Package,
  Tag,
  Users,
  BarChart3,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Eye,
  Trash2,
  TrendingUp,
  Menu,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  LogOut,
  CreditCard,
  Clock,
  MapPin,
  CheckCircle2,
  Save,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import { Product, Offer, Order } from '@/types/database';
import { STORE_SETTINGS_DEFAULTS } from '@/lib/store-settings-defaults';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Settings');
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    products: false,
    offers: false,
    customers: false,
    reports: false,
  });
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Smooth scroll to a dashboard widget section and close mobile drawer
  const scrollToSection = (id: string, navName: string) => {
    setActiveNav(navName);
    setSidebarOpen(false);

    // Timeout ensures mobile drawer has initiated close without interrupting smooth scroll
    setTimeout(() => {
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 60);
  };

  // Toggle submenu expansion without dismissing sidebar
  const toggleDropdown = (menu: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Active section indicator based on current viewport scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveNav('Dashboard Overview');
        return;
      }

      // Tested order from bottom of page upward
      const sections = [
        { id: 'crm-section', name: 'Customers' },
        { id: 'reports-section', name: 'Reports' },
        { id: 'offers-section', name: 'Offers' },
        { id: 'products-section', name: 'Products' },
        { id: 'settings-section', name: 'Settings' },
      ];

      const scrollPos = window.scrollY + 180;
      for (const { id, name } of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPos >= top) {
            setActiveNav(name);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Store Settings Form State
  const [settings, setSettings] = useState({ ...STORE_SETTINGS_DEFAULTS });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Operational Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedOfferCode, setSelectedOfferCode] = useState('');

  // Dynamic order and Pan-India regional telemetry
  const totalOrdersCount = orders.length;
  const uniqueStatesCount = new Set(orders.map((o) => o.state || o.city || 'Tamil Nadu')).size;
  const [orderRegionFilter, setOrderRegionFilter] = useState('All');

  // Modals State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isViewOrdersOpen, setIsViewOrdersOpen] = useState(false);
  const [isManageCampaignsOpen, setIsManageCampaignsOpen] = useState(false);

  // Image Upload State for Add Product
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualImageUrl, setShowManualImageUrl] = useState(false);

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    code: '',
    discount_percentage: 15,
    banner_text: '',
    is_active: true,
    show_in_banner: true,
  });
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState<string | null>(null);

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    category: 'Everyday',
    fabric: 'Pure Japanese Crepe',
    images: [''],
    is_in_stock: true,
  });

  const [adminEmail] = useState(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/wala_admin_email=([^;]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    return 'admin@walaabaya.com';
  });

  const handleSignOut = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project-id')) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch {}

    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {}

    router.push('/admin/login');
  };

  // Load Data
  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, productsRes, offersRes, ordersRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/products'),
          fetch('/api/admin/offers'),
          fetch('/api/admin/orders'),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }

        if (offersRes.ok) {
          const data = await offersRes.json();
          const loadedOffers = data.offers || [];
          setOffers(loadedOffers);
          if (loadedOffers.length > 0) {
            setSelectedOfferCode(
              `${loadedOffers[0].code || loadedOffers[0].title} - ${loadedOffers[0].discount_percentage}% Off`
            );
          }
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      }
    }
    fetchData();
  }, []);

  // Save Settings Handler
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setIsSavingSettings(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaveMessage('Store settings saved and live on storefront.');
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage('Failed to save settings.');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch {
      setSaveMessage('Failed to save settings.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Direct Image File Upload Handler
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/)) {
      setUploadError('Please select a valid image file (.jpg, .png, .webp).');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'products');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      setNewProductForm((prev) => ({
        ...prev,
        images: [data.url],
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading photo';
      setUploadError(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Add Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProductForm,
          price: Number(newProductForm.price),
          images: newProductForm.images.filter((img) => img.trim() !== ''),
        }),
      });
      if (res.ok) {
        setIsAddProductOpen(false);
        setNewProductForm({
          name: '',
          price: '',
          category: 'Everyday',
          fabric: 'Pure Japanese Crepe',
          images: [''],
          is_in_stock: true,
        });
        setUploadError(null);
        setShowManualImageUrl(false);
        setSaveMessage('Product created successfully.');
        setTimeout(() => setSaveMessage(null), 3000);
        const refetch = await fetch('/api/admin/products');
        const d = await refetch.json();
        setProducts(d.products || []);
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  // Toggle Product Visibility / Stock
  const handleToggleProductStock = async (product: Product) => {
    try {
      const updatedStock = !product.is_in_stock;
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_in_stock: updatedStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_in_stock: updatedStock } : p))
        );
      }
    } catch (err) {
      console.error('Stock toggle error:', err);
    }
  };

  // Delete Product with confirmation dialog and instant toast notification
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this piece from the catalog?')) return;
    try {
      // Optimistically update React state immediately
      setProducts((prev) => prev.filter((p) => p.id !== id));

      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSaveMessage('Product deleted successfully.');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const refetch = await fetch('/api/admin/products');
        const d = await refetch.json();
        setProducts(d.products || []);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Campaign Management Handlers
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.code) return;
    setIsSubmittingCampaign(true);
    setCampaignMessage(null);

    try {
      const payload = {
        title: campaignForm.title.trim(),
        code: campaignForm.code.trim().toUpperCase(),
        discount_percentage: Number(campaignForm.discount_percentage),
        banner_text:
          campaignForm.banner_text.trim() ||
          `✨ ${campaignForm.title.toUpperCase()}: ENJOY ${campaignForm.discount_percentage}% OFF WITH CODE ${campaignForm.code.toUpperCase()} ✨`,
        is_active: campaignForm.is_active,
        show_in_banner: campaignForm.show_in_banner,
      };

      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCampaignMessage('Campaign created successfully!');
        setCampaignForm({
          title: '',
          code: '',
          discount_percentage: 15,
          banner_text: '',
          is_active: true,
          show_in_banner: true,
        });

        // Refetch offers
        const refetch = await fetch('/api/admin/offers');
        const d = await refetch.json();
        setOffers(d.offers || []);
        if (payload.code) {
          setSelectedOfferCode(`${payload.code} - ${payload.discount_percentage}% Off`);
        }
        setTimeout(() => setCampaignMessage(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to create campaign');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating campaign';
      setCampaignMessage(msg);
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  const handleToggleCampaign = async (offer: Offer) => {
    try {
      const updatedStatus = !offer.is_active;
      const res = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offer.id, is_active: updatedStatus }),
      });
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, is_active: updatedStatus } : o))
        );
      }
    } catch (err) {
      console.error('Error toggling campaign:', err);
    }
  };

  const handleToggleBanner = async (offer: Offer) => {
    try {
      const updatedBanner = !offer.show_in_banner;
      const res = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offer.id, show_in_banner: updatedBanner }),
      });
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, show_in_banner: updatedBanner } : o))
        );
      }
    } catch (err) {
      console.error('Error toggling banner:', err);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to remove this campaign from the atelier records?')) {
      return;
    }

    // Capture previous state for rollback on error
    const previousOffers = [...offers];
    const previousSelectedOfferCode = selectedOfferCode;
    const targetOffer = offers.find((o) => o.id === campaignId || o.code === campaignId);

    // 1. Optimistic UI Update: remove immediately so card vanishes and count decrements instantly
    const updatedOffers = offers.filter((item) => item.id !== campaignId && item.code !== campaignId);
    setOffers(updatedOffers);

    // 2. Dropdown Sync: if deleted campaign was currently selected in active campaign dropdown, fallback to next available or empty
    const deletedSelectionValue = targetOffer
      ? `${targetOffer.code || targetOffer.title} - ${targetOffer.discount_percentage}% Off`
      : '';
    if (targetOffer && selectedOfferCode === deletedSelectionValue) {
      const nextActive = updatedOffers.find((offer) => offer.is_active);
      if (nextActive) {
        setSelectedOfferCode(`${nextActive.code || nextActive.title} - ${nextActive.discount_percentage}% Off`);
      } else {
        setSelectedOfferCode('');
      }
    }

    // 3. Server / Database Deletion
    try {
      const params = new URLSearchParams({ id: campaignId });
      if (targetOffer?.code) {
        params.set('code', targetOffer.code);
      }

      const res = await fetch(`/api/admin/offers?${params.toString()}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to delete campaign from database');
      }

      setCampaignMessage('Campaign deleted successfully.');
      setTimeout(() => setCampaignMessage(null), 3500);
      setSaveMessage('Campaign deleted successfully.');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: unknown) {
      console.error('Delete campaign error:', err);
      // Rollback optimistic state update on failure
      setOffers(previousOffers);
      setSelectedOfferCode(previousSelectedOfferCode);
      setCampaignMessage('Error deleting campaign. Please try again.');
      setTimeout(() => setCampaignMessage(null), 4000);
    }
  };

  // Filter products for the widget
  const displayedProducts = products
    .filter((p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F7F7F9] text-[#18181B] flex flex-col font-sans">
      {/* ==================================================================== */}
      {/* 1. SITE-WIDE GLOBAL HEADER (TOP BAR) */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E8E8EC] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Toggle + Logo + Breadcrumb Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-[#71717A] hover:text-[#18181B] rounded-md hover:bg-[#F7F7F9]"
                aria-label="Toggle navigation sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/admin" className="flex items-center gap-3">
                <div className="relative h-8 w-28 sm:w-32 flex items-center justify-start shrink-0">
                  <Image
                    src={settings.logo_url || '/logo.png'}
                    alt="WALA ABAYA"
                    fill
                    className="object-contain object-left"
                    unoptimized
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                    Admin Dashboard
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: User Profile Section & Welcome Slogan */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-semibold text-[#18181B] truncate max-w-[180px]">
                    {adminEmail || 'Welcome, Admin'}
                  </span>
                </div>
                <span className="text-[10px] text-[#71717A] tracking-tight">
                  (Bismillahir Rahmanir Rahim) - Assalamu Alaikum
                </span>
              </div>

              {/* User Avatar Placeholder */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#7C5C8A] text-white font-semibold text-xs flex items-center justify-center shadow-sm shrink-0">
                AD
              </div>

              <Link
                href="/"
                target="_blank"
                className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C5C8A] hover:text-[#6A4A78] transition-colors border border-[#7C5C8A]/30 px-2.5 py-1 rounded bg-[#7C5C8A]/5"
              >
                <span>Storefront</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#71717A] hover:text-[#7C5C8A] transition-colors border border-[#E8E8EC] hover:border-[#7C5C8A]/40 px-2.5 py-1 rounded bg-[#F7F7F9]"
                title="Sign out of atelier admin"
              >
                <LogOut className="w-3.5 h-3.5 text-[#7C5C8A]" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. BODY CONTAINER WITH INTERACTIVE SIDEBAR & MAIN CONTENT */}
      {/* ==================================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 relative">
        {/* ==================================================================== */}
        {/* A. INTERACTIVE SIDEBAR (LEFT NAV) */}
        {/* ==================================================================== */}
        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ==================================================================== */}
        {/* A. INTERACTIVE SIDEBAR (LEFT NAV) */}
        {/* ==================================================================== */}
        <aside
          className={`fixed md:sticky top-0 md:top-20 inset-y-0 left-0 z-50 md:z-10 w-64 h-full md:h-auto max-h-[calc(100vh-6rem)] bg-[#FFFFFF] border-r md:border border-[#E8E8EC] md:rounded-lg p-4 shadow-xl md:shadow-sm flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="space-y-4">
            <div className="px-3 pt-2 pb-1 border-b border-[#E8E8EC] md:hidden flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                Navigation Menu
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#F7F7F9] rounded-md transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {/* Dashboard Overview */}
              <button
                type="button"
                onClick={() => scrollToSection('top', 'Dashboard Overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  activeNav === 'Dashboard Overview'
                    ? 'bg-[#7C5C8A]/10 text-[#7C5C8A] font-semibold border-l-4 border-[#7C5C8A]'
                    : 'text-[#71717A] hover:bg-[#F7F7F9] hover:text-[#18181B] border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-[#7C5C8A]" />
                  <span>Dashboard Overview</span>
                </div>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => scrollToSection('settings-section', 'Settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  activeNav === 'Settings'
                    ? 'bg-[#7C5C8A]/10 text-[#7C5C8A] font-semibold border-l-4 border-[#7C5C8A]'
                    : 'text-[#71717A] hover:bg-[#F7F7F9] hover:text-[#18181B] border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-[#7C5C8A]" />
                  <span>Settings</span>
                </div>
              </button>

              {/* Products (Dropdown Toggle + Direct Scroll) */}
              <div className="flex flex-col">
                <div
                  className={`group flex items-center justify-between rounded-md text-xs font-medium transition-all ${
                    activeNav === 'Products'
                      ? 'bg-[#7C5C8A]/10 text-[#7C5C8A] font-semibold border-l-4 border-[#7C5C8A]'
                      : 'text-[#71717A] hover:bg-[#F7F7F9] hover:text-[#18181B] border-l-4 border-transparent'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection('products-section', 'Products')}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    <Package className="w-4 h-4 text-[#7C5C8A]" />
                    <span>Products</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('products', e)}
                    className="p-2 mr-1 text-[#71717A] hover:text-[#7C5C8A] hover:bg-[#7C5C8A]/10 rounded transition-colors"
                    aria-label="Toggle Products submenu"
                    aria-expanded={expandedMenus.products}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        expandedMenus.products ? 'rotate-180 text-[#7C5C8A]' : ''
                      }`}
                    />
                  </button>
                </div>

                {expandedMenus.products && (
                  <div className="pl-9 pr-2 py-1.5 space-y-1 bg-[#F7F7F9]/70 rounded-b-md mt-0.5 border-l-2 border-[#7C5C8A]/30 ml-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddProductOpen(true);
                        setSidebarOpen(false);
                      }}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-[#7C5C8A]" />
                      <span>+ Add Product</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('products-section', 'Products')}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-[#7C5C8A]" />
                      <span>View Catalog ({products.length})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Offers (Dropdown Toggle + Direct Scroll) */}
              <div className="flex flex-col">
                <div
                  className={`group flex items-center justify-between rounded-md text-xs font-medium transition-all ${
                    activeNav === 'Offers'
                      ? 'bg-[#7C5C8A]/10 text-[#7C5C8A] font-semibold border-l-4 border-[#7C5C8A]'
                      : 'text-[#71717A] hover:bg-[#F7F7F9] hover:text-[#18181B] border-l-4 border-transparent'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection('offers-section', 'Offers')}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    <Tag className="w-4 h-4 text-[#7C5C8A]" />
                    <span>Offers</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('offers', e)}
                    className="p-2 mr-1 text-[#71717A] hover:text-[#7C5C8A] hover:bg-[#7C5C8A]/10 rounded transition-colors"
                    aria-label="Toggle Offers submenu"
                    aria-expanded={expandedMenus.offers}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        expandedMenus.offers ? 'rotate-180 text-[#7C5C8A]' : ''
                      }`}
                    />
                  </button>
                </div>

                {expandedMenus.offers && (
                  <div className="pl-9 pr-2 py-1.5 space-y-1 bg-[#F7F7F9]/70 rounded-b-md mt-0.5 border-l-2 border-[#7C5C8A]/30 ml-3">
                    <button
                      type="button"
                      onClick={() => scrollToSection('offers-section', 'Offers')}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-[#7C5C8A]" />
                      <span>Active Campaigns</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('reports-section', 'Reports')}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 text-[#7C5C8A]" />
                      <span>Redemption Volume</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Customers (Dropdown Toggle + Direct Scroll) */}
              <div className="flex flex-col">
                <div
                  className={`group flex items-center justify-between rounded-md text-xs font-medium transition-all ${
                    activeNav === 'Customers'
                      ? 'bg-[#7C5C8A]/10 text-[#7C5C8A] font-semibold border-l-4 border-[#7C5C8A]'
                      : 'text-[#71717A] hover:bg-[#F7F7F9] hover:text-[#18181B] border-l-4 border-transparent'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection('crm-section', 'Customers')}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    <Users className="w-4 h-4 text-[#7C5C8A]" />
                    <span>Customers</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('customers', e)}
                    className="p-2 mr-1 text-[#71717A] hover:text-[#7C5C8A] hover:bg-[#7C5C8A]/10 rounded transition-colors"
                    aria-label="Toggle Customers submenu"
                    aria-expanded={expandedMenus.customers}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        expandedMenus.customers ? 'rotate-180 text-[#7C5C8A]' : ''
                      }`}
                    />
                  </button>
                </div>

                {expandedMenus.customers && (
                  <div className="pl-9 pr-2 py-1.5 space-y-1 bg-[#F7F7F9]/70 rounded-b-md mt-0.5 border-l-2 border-[#7C5C8A]/30 ml-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsViewOrdersOpen(true);
                        setSidebarOpen(false);
                      }}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3 text-[#7C5C8A]" />
                      <span>View Orders ({orders.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('crm-section', 'Customers')}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Users className="w-3 h-3 text-[#7C5C8A]" />
                      <span>Pan-India Client Hub</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Reports (Dropdown Toggle + Direct Scroll) */}
              <div className="flex flex-col">
                <div
                  className={`group flex items-center justify-between rounded-md text-xs font-medium transition-all ${
                    activeNav === 'Reports'
                      ? 'bg-[#7C5C8A]/10 text-[#7C5C8A] font-semibold border-l-4 border-[#7C5C8A]'
                      : 'text-[#71717A] hover:bg-[#F7F7F9] hover:text-[#18181B] border-l-4 border-transparent'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection('reports-section', 'Reports')}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    <BarChart3 className="w-4 h-4 text-[#7C5C8A]" />
                    <span>Reports</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('reports', e)}
                    className="p-2 mr-1 text-[#71717A] hover:text-[#7C5C8A] hover:bg-[#7C5C8A]/10 rounded transition-colors"
                    aria-label="Toggle Reports submenu"
                    aria-expanded={expandedMenus.reports}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        expandedMenus.reports ? 'rotate-180 text-[#7C5C8A]' : ''
                      }`}
                    />
                  </button>
                </div>

                {expandedMenus.reports && (
                  <div className="pl-9 pr-2 py-1.5 space-y-1 bg-[#F7F7F9]/70 rounded-b-md mt-0.5 border-l-2 border-[#7C5C8A]/30 ml-3">
                    <button
                      type="button"
                      onClick={() => scrollToSection('reports-section', 'Reports')}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 text-[#7C5C8A]" />
                      <span>Redemption Volume</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReportsOpen(true);
                        setSidebarOpen(false);
                      }}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#71717A] hover:text-[#7C5C8A] hover:bg-white rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <BarChart3 className="w-3 h-3 text-[#7C5C8A]" />
                      <span>Full Analytics Summary</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </aside>

        {/* ==================================================================== */}
        {/* MAIN CONTENT AREA */}
        {/* ==================================================================== */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Centered Card with Purple Border Accent */}
          <div
            id="settings-section"
            className="bg-[#FFFFFF] border border-[#E8E8EC] border-t-4 border-t-[#7C5C8A] rounded-lg p-6 sm:p-8 shadow-sm space-y-8 scroll-mt-24"
          >
            {/* Header: Title & Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8EC]">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#18181B]">
                  Store Settings & Operations
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Central command center for Wala Abaya atelier identity, customer messaging, and inventory controls.
                </p>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {saveMessage && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {saveMessage}
                  </span>
                )}

                {/* Secondary Action: Preview Storefront */}
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F7F7F9] border border-[#E8E8EC] text-[#18181B] text-xs font-semibold rounded-md shadow-xs transition-colors"
                  title="Open live storefront in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#7C5C8A]" />
                  <span>Preview Storefront</span>
                </a>

                {/* Primary Action: Save All Changes */}
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={isSavingSettings}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs font-semibold rounded-md shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ==================================================================== */}
            {/* C. 'GLOBAL STORE SETTINGS (EDITABLE)' FORM BLOCK */}
            {/* ==================================================================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#18181B]">
                    Global Store Settings (Editable)
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Click any card to modify operational details, contact coordinates, or payment keys.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Business Name */}
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Business Name
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="text"
                      value={settings.business_name}
                      onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  {/* 2. Support Mobile */}
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Support Mobile / WhatsApp
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="text"
                      value={settings.support_mobile}
                      onChange={(e) => setSettings({ ...settings, support_mobile: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  {/* 3. Support Email */}
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Support Email
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  {/* 4. Business Address */}
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Business & Atelier Address
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="text"
                      value={settings.business_address}
                      onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Atelier Title / Location
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="text"
                      value={settings.atelier_title}
                      onChange={(e) => setSettings({ ...settings, atelier_title: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Physical Address & Pincode
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <textarea
                      rows={2}
                      value={settings.atelier_address}
                      onChange={(e) => setSettings({ ...settings, atelier_address: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A] resize-none leading-relaxed"
                    />
                  </div>

                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Atelier Concierge Phone
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="text"
                      value={settings.atelier_phone}
                      onChange={(e) => setSettings({ ...settings, atelier_phone: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Concierge Email Address
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="email"
                      value={settings.atelier_email}
                      onChange={(e) => setSettings({ ...settings, atelier_email: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Operational Working Hours
                      </span>
                      <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                    </div>
                    <input
                      type="text"
                      value={settings.atelier_hours}
                      onChange={(e) => setSettings({ ...settings, atelier_hours: e.target.value })}
                      className="w-full text-xs font-semibold text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>

                  {/* 5. Razorpay Key ID */}
                  <div className="p-3.5 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1 sm:col-span-2 lg:col-span-2">
                    <div className="flex items-center justify-between text-[#71717A]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3 text-[#7C5C8A]" />
                        Payment Gateway (Razorpay Key ID)
                      </span>
                      <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-50 text-[#7C5C8A] font-semibold border border-[#7C5C8A]/20">
                        Online Checkout
                      </span>
                    </div>
                    <input
                      type="text"
                      value={settings.razorpay_key_id}
                      onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                      placeholder="rzp_live_... or rzp_test_..."
                      className="w-full text-xs font-mono font-medium text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A]"
                    />
                  </div>
                </div>

                {/* 6. Welcome Message & Slogan (Wide Card) */}
                <div className="p-4 bg-[#FFFFFF] border border-[#E8E8EC] hover:border-[#7C5C8A]/50 rounded-lg shadow-subtle transition-all space-y-1">
                  <div className="flex items-center justify-between text-[#71717A] mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                      Welcome Message & Slogan
                    </span>
                    <Pencil className="w-3 h-3 text-[#7C5C8A]" />
                  </div>
                  <textarea
                    rows={2}
                    value={settings.welcome_slogan}
                    onChange={(e) => setSettings({ ...settings, welcome_slogan: e.target.value })}
                    className="w-full text-xs text-[#18181B] bg-transparent focus:outline-none focus:border-b focus:border-[#7C5C8A] resize-none leading-relaxed"
                  />
                </div>
              </form>
            </div>

            {/* ==================================================================== */}
            {/* D. BOTTOM OPERATIONAL ROW (THREE-COLUMN RESPONSIVE LAYOUT) */}
            {/* ==================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-[#E8E8EC]">
              {/* ------------------------------------------------------------------ */}
              {/* WIDGET 1: PRODUCT MANAGEMENT */}
              {/* ------------------------------------------------------------------ */}
              <div
                id="products-section"
                className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-lg p-5 shadow-subtle flex flex-col justify-between space-y-4 scroll-mt-24"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#18181B]">Product Management</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs font-medium rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Product</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>

                  {/* List View of Products */}
                  <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                    {displayedProducts.length > 0 ? (
                      displayedProducts.map((p, idx) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2.5 bg-[#F7F7F9] rounded border border-[#E8E8EC]/80 hover:border-[#7C5C8A]/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8 rounded bg-white overflow-hidden border border-[#E8E8EC] shrink-0">
                              <Image
                                src={p.images?.[0] || '/logo.png'}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#18181B] line-clamp-1">
                                {p.name || `Product #${idx + 1}`}
                              </p>
                              <span className="text-[10px] text-[#71717A]">
                                ₹{p.price} • {p.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleProductStock(p)}
                              className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded ${
                                p.is_in_stock
                                  ? 'bg-[#7C5C8A]/10 text-[#7C5C8A]'
                                  : 'bg-zinc-200 text-zinc-600'
                              }`}
                            >
                              {p.is_in_stock ? 'Visible' : 'Hidden'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-[#71717A] bg-[#F7F7F9] rounded">
                        No pieces currently listed. Click &apos;+ Add Product&apos; above.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Note */}
                <p className="text-[10px] text-[#71717A] pt-2 border-t border-[#E8E8EC]">
                  Note: Component requires active approvals required.
                </p>
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* WIDGET 2: OFFER & DISCOUNT MANAGEMENT */}
              {/* ------------------------------------------------------------------ */}
              <div
                id="offers-section"
                className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-lg p-5 shadow-subtle flex flex-col justify-between space-y-4 scroll-mt-24"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#18181B]">
                      Offer & Discount Management
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsManageCampaignsOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-[11px] font-medium rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ New Campaign</span>
                    </button>
                  </div>

                  {/* Dropdown selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-semibold text-[#71717A]">
                        Active Campaign
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsManageCampaignsOpen(true)}
                        className="text-[10px] text-[#7C5C8A] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        <span>Edit Campaigns</span>
                      </button>
                    </div>
                    {offers.length > 0 ? (
                      <select
                        value={selectedOfferCode}
                        onChange={(e) => setSelectedOfferCode(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                      >
                        {offers.map((off) => (
                          <option key={off.id} value={`${off.code || off.title} - ${off.discount_percentage}% Off`}>
                            {off.title} ({off.discount_percentage}% Off) {off.code ? `• ${off.code}` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs text-[#71717A]">
                        No active campaigns configured
                      </div>
                    )}
                  </div>

                  {/* Clean Status & Telemetry Container */}
                  <div
                    id="reports-section"
                    className="p-3.5 bg-[#F7F7F9] rounded border border-[#E8E8EC] space-y-2 scroll-mt-24"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-[#71717A]">
                        Redemption Volume
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-200/80 text-[#71717A]">
                        {offers.length > 0 ? `${offers.length} Active` : 'No Promo Data'}
                      </span>
                    </div>

                    <div className="py-5 px-3 flex flex-col items-center justify-center text-center rounded bg-white/60 border border-[#E8E8EC]/60">
                      <TrendingUp className="w-5 h-5 text-[#7C5C8A]/40 mb-1.5" />
                      <p className="text-xs font-semibold text-[#18181B]">
                        No redemption data recorded yet
                      </p>
                      <p className="text-[10px] text-[#71717A] mt-0.5 max-w-[220px]">
                        Redemption telemetry will populate once customers apply promotion codes during checkout.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#71717A] pt-2 border-t border-[#E8E8EC]">
                  <span>Active Promo Rules:</span>
                  <span className="font-semibold text-[#18181B]">
                    {offers.length} {offers.length === 1 ? 'Campaign' : 'Campaigns'}
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* WIDGET 3: MINI-CRM */}
              {/* ------------------------------------------------------------------ */}
              <div
                id="crm-section"
                className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-lg p-5 shadow-subtle flex flex-col justify-between space-y-4 scroll-mt-24"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#18181B]">Mini-CRM</h4>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#7C5C8A]/10 text-[#7C5C8A] rounded uppercase">
                      Pan-India Client Hub
                    </span>
                  </div>

                  {/* Percentage Display */}
                  <div className="flex items-center gap-4 p-3 bg-[#F7F7F9] rounded border border-[#E8E8EC]">
                    <div className="w-14 h-14 rounded-full bg-[#7C5C8A] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                      {totalOrdersCount > 0 ? '100%' : '0%'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#18181B] block">
                        All-India Orders
                      </span>
                      <p className="text-[11px] text-[#71717A]">
                        {totalOrdersCount > 0
                          ? `${totalOrdersCount} client orders dispatched across ${uniqueStatesCount} state${uniqueStatesCount === 1 ? '' : 's'} & territories.`
                          : 'Awaiting initial orders to calculate nationwide delivery metrics.'}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-[#FFFFFF] border border-[#E8E8EC] rounded">
                      <span className="text-[10px] text-[#71717A] uppercase font-semibold block">
                        All-India Orders:
                      </span>
                      <span className="font-bold text-sm text-[#18181B]">
                        {totalOrdersCount}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#FFFFFF] border border-[#E8E8EC] rounded">
                      <span className="text-[10px] text-[#71717A] uppercase font-semibold block">
                        Active Territories:
                      </span>
                      <span className="font-bold text-sm text-[#7C5C8A]">
                        {totalOrdersCount > 0 ? `${uniqueStatesCount} Hubs` : 'All India'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Button: View Orders */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsViewOrdersOpen(true)}
                    className="w-full py-2 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs font-semibold rounded shadow-sm transition-colors text-center cursor-pointer"
                  >
                    View Orders ({totalOrdersCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ==================================================================== */}
      {/* ADD PRODUCT MODAL */}
      {/* ==================================================================== */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white border border-[#E8E8EC] w-full max-w-md rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#E8E8EC] flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#18181B]">
                Add Piece to Catalog
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="text-[#71717A] hover:text-[#18181B]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#18181B] mb-1">Piece Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Noir Crepe Abaya"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#18181B] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#18181B] mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                  >
                    <option value="Everyday">Everyday</option>
                    <option value="Evening">Evening</option>
                    <option value="Silk">Silk</option>
                    <option value="Ramadan">Ramadan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#18181B] mb-1">Fabric</label>
                <input
                  type="text"
                  placeholder="Pure Japanese Crepe"
                  value={newProductForm.fabric}
                  onChange={(e) => setNewProductForm({ ...newProductForm, fabric: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                />
              </div>

              {/* Product Photo Upload */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#18181B]">
                  Abaya Photo / Image *
                </label>

                {newProductForm.images[0] && newProductForm.images[0].trim() !== '' ? (
                  <div className="relative p-2.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="relative w-12 h-14 rounded bg-white overflow-hidden border border-[#E8E8EC] shrink-0">
                        <Image
                          src={newProductForm.images[0]}
                          alt="Product preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-semibold text-[#18181B] truncate">
                          Image ready for catalog
                        </p>
                        <p className="text-[10px] text-[#71717A] truncate font-mono">
                          {newProductForm.images[0]}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNewProductForm((prev) => ({ ...prev, images: [''] }))
                      }
                      className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 border border-[#E8E8EC] rounded text-[10px] font-semibold shrink-0 transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#E8E8EC] hover:border-[#7C5C8A] rounded-md bg-[#F7F7F9] hover:bg-[#F5EFF8]/40 transition-colors cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleImageFileUpload}
                        disabled={isUploadingImage}
                        className="sr-only"
                      />
                      {isUploadingImage ? (
                        <div className="py-2 flex flex-col items-center gap-1.5">
                          <Loader2 className="w-5 h-5 text-[#7C5C8A] animate-spin" />
                          <span className="text-[11px] font-medium text-[#7C5C8A]">
                            Uploading to Atelier Storage...
                          </span>
                        </div>
                      ) : (
                        <div className="py-1 flex flex-col items-center gap-1">
                          <UploadCloud className="w-6 h-6 text-[#7C5C8A]" />
                          <span className="text-xs font-semibold text-[#18181B]">
                            Choose Image from Device
                          </span>
                          <span className="text-[10px] text-[#71717A]">
                            PNG, JPG, or WEBP (Max 5MB)
                          </span>
                        </div>
                      )}
                    </label>

                    {uploadError && (
                      <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        {uploadError}
                      </p>
                    )}

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowManualImageUrl(!showManualImageUrl)}
                        className="text-[10px] text-[#7C5C8A] hover:underline cursor-pointer"
                      >
                        {showManualImageUrl ? 'Hide manual URL input' : 'Or enter image URL manually'}
                      </button>
                    </div>

                    {showManualImageUrl && (
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newProductForm.images[0]}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, images: [e.target.value] })
                        }
                        className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8E8EC]">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#71717A] hover:text-[#18181B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs font-semibold rounded"
                >
                  Create Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW ORDERS MODAL */}
      {/* ==================================================================== */}
      {isViewOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white border border-[#E8E8EC] w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E8E8EC] flex items-center justify-between bg-[#F7F7F9]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#18181B] flex items-center gap-2">
                  <span>Pan-India Client Orders & Tailoring Inquiries</span>
                  <span className="px-2 py-0.5 text-[11px] font-sans font-bold bg-[#7C5C8A] text-white rounded-full">
                    {orders.length}
                  </span>
                </h3>
                <p className="text-xs text-[#71717A]">
                  All-India doorstep dispatches, payment verification & bespoke tailoring records
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewOrdersOpen(false)}
                className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded hover:bg-[#E8E8EC] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pan-India Regional Filter */}
            {orders.length > 0 && (
              <div className="px-6 py-2.5 bg-white border-b border-[#E8E8EC] flex items-center justify-between gap-3 overflow-x-auto">
                <div className="flex items-center gap-2 text-xs text-[#71717A] shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#7C5C8A]" />
                  <span className="font-semibold text-[#18181B]">State / City Filter:</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {['All', ...Array.from(new Set(orders.map((o) => o.state || o.city).filter(Boolean)))].map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setOrderRegionFilter(region)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                        orderRegionFilter === region
                          ? 'bg-[#7C5C8A] text-white shadow-sm'
                          : 'bg-[#F7F7F9] text-[#71717A] hover:bg-[#E8E8EC] hover:text-[#18181B]'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 overflow-y-auto space-y-4">
              {(() => {
                const displayedOrders = orders.filter((o) => {
                  if (orderRegionFilter === 'All') return true;
                  return o.state === orderRegionFilter || o.city === orderRegionFilter;
                });

                return displayedOrders.length > 0 ? (
                  displayedOrders.map((o) => {
                    const isPaid = o.payment_status === 'paid' || o.payment_method === 'razorpay';
                    const itemsList = Array.isArray(o.items) && o.items.length > 0 ? o.items : null;
                    const orderTotal = o.total_amount || o.final_total || (o.price ? o.price : null);

                    return (
                      <div
                        key={o.id}
                        className="p-4 bg-[#FFFFFF] border border-[#E8E8EC] rounded-lg shadow-sm hover:border-[#7C5C8A]/40 transition-colors space-y-3"
                      >
                        {/* Top Bar: Customer Info + Status Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E8EC] pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#18181B]">{o.customer_name}</span>
                              <span className="font-mono text-xs text-[#71717A] bg-[#F7F7F9] px-2 py-0.5 rounded border border-[#E8E8EC]">
                                {o.customer_phone}
                              </span>
                              {o.customer_email && (
                                <span className="text-xs text-[#71717A] hidden md:inline">
                                  ({o.customer_email})
                                </span>
                              )}
                            </div>
                            {o.created_at && (
                              <span className="text-[10px] text-[#A1A1AA] block mt-0.5">
                                {new Date(o.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                PAID (Razorpay / UPI)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                                <Clock className="w-3 h-3 text-amber-600" />
                                AWAITING PREPAID VERIFICATION (WhatsApp Direct)
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#7C5C8A]/10 text-[#7C5C8A] rounded">
                              {o.status || 'Received'}
                            </span>
                          </div>
                        </div>

                        {/* Itemized Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-[#E8E8EC] text-[10px] uppercase tracking-wider text-[#71717A]">
                                <th className="py-1.5 font-medium">Bespoke Piece</th>
                                <th className="py-1.5 font-medium text-center">Size</th>
                                <th className="py-1.5 font-medium text-center">Qty</th>
                                <th className="py-1.5 font-medium text-right">Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E8EC]/60">
                              {itemsList ? (
                                itemsList.map((item, idx) => (
                                  <tr key={idx} className="text-[#18181B]">
                                    <td className="py-2 pr-2">
                                      <div className="font-medium">{item.name}</div>
                                      {item.customAlterationNotes && (
                                        <div className="text-[10px] text-[#7C5C8A] italic">
                                          Tailoring: {item.customAlterationNotes}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2 px-2 text-center">
                                      <span className="px-2 py-0.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-[11px] font-mono">
                                        {item.size}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2 text-center font-mono">
                                      x{item.quantity}
                                    </td>
                                    <td className="py-2 pl-2 text-right font-semibold">
                                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr className="text-[#18181B]">
                                  <td className="py-2 pr-2">
                                    <div className="font-medium">{o.product_name}</div>
                                    {o.custom_alterations && (
                                      <div className="text-[10px] text-[#7C5C8A] italic">
                                        Tailoring: {o.custom_alterations}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <span className="px-2 py-0.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-[11px] font-mono">
                                      {o.selected_size}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-center font-mono">x1</td>
                                  <td className="py-2 pl-2 text-right font-semibold">
                                    {o.price ? `₹${Number(o.price).toLocaleString('en-IN')}` : 'Bespoke Quote'}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Delivery Coordinates & Notes */}
                        <div className="pt-2 border-t border-[#E8E8EC] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-[#F7F7F9]/70 p-3 rounded">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[#18181B] font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#7C5C8A]" />
                              <span>
                                {[o.address, o.locality, o.city, o.state, o.pincode]
                                  .filter(Boolean)
                                  .join(', ') || 'Pan-India Delivery Address Pending'}
                              </span>
                            </div>
                            {(o.notes || o.custom_alterations) && (
                              <p className="text-[11px] text-[#71717A] italic pl-5">
                                Note: {o.notes || o.custom_alterations}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                            {orderTotal && (
                              <div className="text-right">
                                <span className="text-[10px] uppercase tracking-wider text-[#71717A] block">
                                  Order Total
                                </span>
                                <span className="font-bold text-sm text-[#18181B]">
                                  ₹{Number(orderTotal).toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}

                            <a
                              href={`https://wa.me/${o.customer_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                                `Salam ${o.customer_name}, confirming your Wala Abaya order #${o.id?.slice(0, 8)} (${o.product_name || 'Bespoke Collection'}). We are preparing your order for express all-India dispatch.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#7C5C8A] text-white rounded text-xs font-semibold hover:bg-[#6A4A78] transition-colors shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-[#71717A] space-y-2">
                    <p className="font-medium">No orders found for the selected region.</p>
                    <button
                      type="button"
                      onClick={() => setOrderRegionFilter('All')}
                      className="text-xs text-[#7C5C8A] underline hover:text-[#6A4A78]"
                    >
                      Reset filter to All Regions
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-3 border-t border-[#E8E8EC] flex justify-between items-center bg-[#F7F7F9]">
              <span className="text-xs text-[#71717A]">
                Showing {orders.length} order{orders.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={() => setIsViewOrdersOpen(false)}
                className="px-4 py-2 bg-white border border-[#E8E8EC] hover:bg-[#F7F7F9] text-xs font-semibold rounded text-[#18181B] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PERFORMANCE & ANALYTICS SUMMARY MODAL */}
      {/* ==================================================================== */}
      {isReportsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white border border-[#E8E8EC] w-full max-w-xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#E8E8EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#18181B] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#7C5C8A]" />
                  <span>Performance & Analytics Summary</span>
                </h3>
                <p className="text-[11px] text-[#71717A]">
                  Consolidated operational indicators for Wala Abaya atelier
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportsOpen(false)}
                className="text-[#71717A] hover:text-[#18181B] p-1"
                aria-label="Close analytics modal"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Quick KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#F7F7F9] border border-[#E8E8EC] rounded">
                  <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Total Pieces</span>
                  <span className="font-bold text-base text-[#18181B] mt-0.5 block">{products.length}</span>
                  <span className="text-[10px] text-[#7C5C8A] font-medium">{products.filter((p) => p.is_in_stock).length} In Stock</span>
                </div>
                <div className="p-3 bg-[#F7F7F9] border border-[#E8E8EC] rounded">
                  <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Total Orders</span>
                  <span className="font-bold text-base text-[#18181B] mt-0.5 block">{totalOrdersCount}</span>
                  <span className="text-[10px] text-[#71717A] font-medium">
                    {totalOrdersCount > 0 ? `${totalOrdersCount} recorded` : 'No orders yet'}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F7F9] border border-[#E8E8EC] rounded">
                  <span className="text-[10px] text-[#71717A] uppercase font-semibold block">All-India Orders</span>
                  <span className="font-bold text-base text-[#7C5C8A] mt-0.5 block">{uniqueStatesCount} {uniqueStatesCount === 1 ? 'State' : 'States'}</span>
                  <span className="text-[10px] text-[#71717A]">
                    {totalOrdersCount > 0 ? `${totalOrdersCount} Pan-India orders` : 'Awaiting data'}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F7F9] border border-[#E8E8EC] rounded">
                  <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Campaigns</span>
                  <span className="font-bold text-base text-[#18181B] mt-0.5 block">{offers.length}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {offers.length > 0 ? `${offers.length} Active` : 'None active'}
                  </span>
                </div>
              </div>

              {/* Breakdown by Category */}
              <div className="p-4 bg-[#FFFFFF] border border-[#E8E8EC] rounded space-y-2">
                <h4 className="font-semibold text-xs text-[#18181B]">Catalog Category Breakdown</h4>
                <div className="space-y-2 pt-1">
                  {['Everyday', 'Evening', 'Silk', 'Ramadan'].map((cat) => {
                    const count = products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
                    const pct = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#52525B] font-medium">{cat}</span>
                          <span className="text-[#71717A] font-mono">{count} pieces ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E8E8EC] rounded-full overflow-hidden">
                          <div className="h-full bg-[#7C5C8A] rounded-full" style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Redemption Growth Note */}
              <div className="p-3 bg-[#7C5C8A]/5 border border-[#7C5C8A]/20 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#7C5C8A]" />
                  <span className="text-[11px] font-semibold text-[#18181B]">Coupon Redemption Volume:</span>
                </div>
                <span className="text-xs font-medium text-[#71717A]">
                  No redemption data recorded yet
                </span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E8E8EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsReportsOpen(false);
                  scrollToSection('reports-section', 'Reports');
                }}
                className="px-3 py-1.5 bg-[#7C5C8A] text-white text-xs font-semibold rounded hover:bg-[#6A4A78] transition-colors"
              >
                Go to Reports Section
              </button>
              <button
                type="button"
                onClick={() => setIsReportsOpen(false)}
                className="px-4 py-1.5 bg-[#F7F7F9] border border-[#E8E8EC] text-xs font-semibold rounded text-[#18181B]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CAMPAIGN MANAGEMENT MODAL */}
      {/* ==================================================================== */}
      {isManageCampaignsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white border border-[#E8E8EC] w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E8E8EC] flex items-center justify-between bg-[#F7F7F9]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#18181B] flex items-center gap-2">
                  <span>Offer & Campaign Management</span>
                  <span className="px-2 py-0.5 text-[11px] font-sans font-bold bg-[#7C5C8A] text-white rounded-full">
                    {offers.length}
                  </span>
                </h3>
                <p className="text-xs text-[#71717A]">
                  Configure promotional codes, percentage discounts, and top announcement bar banners
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsManageCampaignsOpen(false)}
                className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded hover:bg-[#E8E8EC] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {campaignMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{campaignMessage}</span>
                </div>
              )}

              {/* SECTION A: CREATE NEW CAMPAIGN FORM */}
              <div className="p-4 bg-[#F7F7F9] rounded-lg border border-[#E8E8EC] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B] uppercase tracking-wider">
                  <Plus className="w-3.5 h-3.5 text-[#7C5C8A]" />
                  <span>Create New Promo Campaign</span>
                </div>

                <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-[#18181B] mb-1">
                        Campaign Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eid Special"
                        value={campaignForm.title}
                        onChange={(e) =>
                          setCampaignForm({ ...campaignForm, title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#18181B] mb-1">
                        Coupon Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. EID2026"
                        value={campaignForm.code}
                        onChange={(e) =>
                          setCampaignForm({
                            ...campaignForm,
                            code: e.target.value.toUpperCase().replace(/\s+/g, ''),
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded text-xs font-mono font-bold focus:outline-none focus:border-[#7C5C8A]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#18181B] mb-1">
                        Discount % *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        placeholder="15"
                        value={campaignForm.discount_percentage}
                        onChange={(e) =>
                          setCampaignForm({
                            ...campaignForm,
                            discount_percentage: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded text-xs font-mono font-bold focus:outline-none focus:border-[#7C5C8A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#18181B] mb-1">
                      Announcement Bar Headline (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="✨ EID SPECIAL: ENJOY 20% OFF ALL BESPOKE ABAYAS WITH CODE EID2026 ✨"
                      value={campaignForm.banner_text}
                      onChange={(e) =>
                        setCampaignForm({ ...campaignForm, banner_text: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#E8E8EC] rounded text-xs focus:outline-none focus:border-[#7C5C8A]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={campaignForm.is_active}
                          onChange={(e) =>
                            setCampaignForm({ ...campaignForm, is_active: e.target.checked })
                          }
                          className="w-3.5 h-3.5 rounded border-[#E8E8EC] text-[#7C5C8A] focus:ring-[#7C5C8A] accent-[#7C5C8A]"
                        />
                        <span className="font-medium text-[#18181B]">Active</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={campaignForm.show_in_banner}
                          onChange={(e) =>
                            setCampaignForm({ ...campaignForm, show_in_banner: e.target.checked })
                          }
                          className="w-3.5 h-3.5 rounded border-[#E8E8EC] text-[#7C5C8A] focus:ring-[#7C5C8A] accent-[#7C5C8A]"
                        />
                        <span className="font-medium text-[#18181B]">Show in Top Banner</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingCampaign}
                      className="px-4 py-2 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingCampaign ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Create Campaign</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION B: EXISTING CAMPAIGNS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                    Existing Atelier Campaigns ({offers.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {offers.length > 0 ? (
                    offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3 bg-white border border-[#E8E8EC] rounded-lg shadow-2xs hover:border-[#7C5C8A]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#18181B]">{offer.title}</span>
                            {offer.code && (
                              <span className="px-2 py-0.5 bg-[#7C5C8A]/10 text-[#7C5C8A] font-mono font-bold rounded border border-[#7C5C8A]/30">
                                {offer.code}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                              {offer.discount_percentage}% OFF
                            </span>
                          </div>
                          {offer.banner_text && (
                            <p className="text-[11px] text-[#71717A] italic line-clamp-1">
                              &ldquo;{offer.banner_text}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Active Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleCampaign(offer)}
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                              offer.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {offer.is_active ? 'Active' : 'Disabled'}
                          </button>

                          {/* Banner Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleBanner(offer)}
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                              offer.show_in_banner
                                ? 'bg-[#7C5C8A]/20 text-[#7C5C8A]'
                                : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            {offer.show_in_banner ? 'In Banner' : 'Off Banner'}
                          </button>

                          {/* Delete Campaign */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCampaign(offer.id);
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-[#F7F7F9] rounded border border-[#E8E8EC] text-[#71717A]">
                      No promotional campaigns configured yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#E8E8EC] flex justify-end bg-[#F7F7F9]">
              <button
                type="button"
                onClick={() => setIsManageCampaignsOpen(false)}
                className="px-4 py-2 bg-white border border-[#E8E8EC] hover:bg-[#F7F7F9] text-xs font-semibold rounded text-[#18181B] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
