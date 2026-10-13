export interface Product {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  active_discount_id?: string | null;
  category: string;
  fabric: string;
  description: string | null;
  images: string[];
  sizes: string[];
  is_in_stock: boolean;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'cancelled';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string; // 52, 54, 56, 58, 60, Custom
  quantity: number;
  customAlterationNotes?: string;
}

export interface OrderItem {
  product_id?: string;
  name: string;
  slug?: string;
  size: string;
  quantity: number;
  price: number;
  notes?: string;
  customAlterationNotes?: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  address?: string | null;
  locality?: string | null;
  city: string;
  state?: string | null;
  pincode?: string | null;
  product_id: string | null;
  product_name: string;
  selected_size: string;
  custom_height: string | null;
  custom_notes: string | null;
  custom_alterations?: string | null;
  notes?: string | null;
  items?: OrderItem[];
  payment_method?: 'razorpay' | 'whatsapp' | 'whatsapp_transfer' | string;
  payment_status?: 'pending' | 'paid' | 'failed' | string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  applied_discount_code?: string | null;
  discount_amount?: number | null;
  final_price?: number | null;
  final_total?: number | null;
  total_amount?: number | null;
  price?: number | null;
  status: OrderStatus;
}

export interface StoreSettings {
  key: string;
  value: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  created_at: string;
  title: string;
  code: string | null;
  discount_percentage: number;
  banner_text: string | null;
  is_active: boolean;
  show_in_banner: boolean;
}

export type CustomerLifecycleStage = 'lead' | 'active_client' | 'vip' | 'inactive';

export interface Customer {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  total_orders: number;
  total_spend: number;
  lifecycle_stage: CustomerLifecycleStage;
  admin_notes: string | null;
}

export interface OrderInquiryFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  locality?: string;
  city: string;
  state?: string;
  pincode?: string;
  product_id?: string;
  product_name: string;
  selected_size: string;
  custom_height?: string;
  custom_notes?: string;
  items?: OrderItem[];
  payment_method?: 'razorpay' | 'whatsapp' | 'whatsapp_transfer';
  payment_status?: 'pending' | 'paid' | 'failed';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  applied_discount_code?: string;
  discount_amount?: number;
  final_price?: number;
}
