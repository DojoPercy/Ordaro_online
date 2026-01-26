export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  companyType: string;
  description?: string;
  branches?: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  status: "OPEN" | "CLOSED" | "BUSY" | "PRE_ORDER";
  distance?: number; // Calculated field
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  categoryId: string;
  isActive: boolean;
  isAvailable: boolean; // Computed based on branch overrides
  branchPrice?: number; // Computed based on branch overrides
  variants?: MenuVariant[];
}

export interface MenuVariant {
  id: string;
  name: string;
  price: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  queuePosition?: number;
  estimatedReadyAt?: string;
  createdAt: string;
  items: OrderLine[];
}

export interface OrderLine {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  menuItem: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  modifiers?: OrderModifier[];
  notes?: string;
}

export interface OrderModifier {
  name: string;
  price: number;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CartItem {
  tempId: string; // For frontend unique keys
  menuItem: MenuItem;
  variant?: MenuVariant;
  quantity: number;
  modifiers: OrderModifier[];
  notes?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
