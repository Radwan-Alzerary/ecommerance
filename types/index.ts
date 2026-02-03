export interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  secenderyPrice?: number;
  priceCurrency?: string;
  image?: { url: string };
  images?: Array<{ url: string } | string>;
  category: Category;
  rating: number[] | number;
  description?: string;
  colors: string[];
  sizes: string[];
  dateAdded?: string;
  active?: boolean;
  quantety?: number;
  unit?: string;
  ingredients?: any[];
  barcode?: string;
  manualBarcode?: string;
  cost?: number;
  alertBeforeDays?: number;
  costCurrency?: string;
  discount?: number;
  printable?: boolean;
  packageCheck?: boolean;
  boxPrice?: number;
  boxCost?: number;
  boxAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  syncStatus?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  storge?: string;
}
// Assuming you have this from previous steps
export interface Customer {
  _id: string;
  name: string;
  email?: string; // Optional if signup allows phone only
  phoneNumber?: string; // Optional if signup allows email only
  // Add other relevant non-sensitive fields
  createdAt: string;
  updatedAt: string;
}

// You might not need this if backend sets HttpOnly cookie
export interface AuthResponse {
    success: boolean;
    token?: string; // Only if token is sent in body
    data: Customer;
    message?: string;
}

export interface CartItem extends Product {
    productId: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Category {
  _id:string;
  id: string;
  name: string;
  image: string;
}


export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

export interface HeroSlide {
  id: number | string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  fallbackImage: string;
  link: string;
  buttonText: string;
  theme: 'luxury' | 'vibrant' | 'futuristic';
  stats: {
    label: string;
    value: string;
  };
  translations?: {
    [language: string]: {
      title?: string;
      subtitle?: string;
      description?: string;
      buttonText?: string;
    };
  };
  isActive?: boolean;
  order?: number;
}

export interface NotificationItem {
  _id: string;
  id?: string;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
  createdAt?: string;
  link?: string;
}

export interface CustomSection {
  _id: string;
  id: string;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  description?: {
    en?: string;
    ar?: string;
  };
  settings: {
    itemsPerRow?: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    layout: 'grid' | 'carousel' | 'list';
    maxProducts?: number;
    showPagination?: boolean;
    showSorting?: boolean;
    autoplay?: boolean;
    autoplayDelay?: number;
    showNavigation?: boolean;
    spaceBetween?: number;
    displayType?: 'grid' | 'carousel' | 'list';
    showTitle?: boolean;
    showDescription?: boolean;
    showAddToCart?: boolean;
    showViewAll?: boolean;
    maxItems?: number;
  };
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: number;
  };
  visibility: {
    enabled: boolean;
    showInMenu?: boolean;
    showOnHomepage: boolean;
    requiredRole?: string;
  };
  seo?: {
    metaTitle?: {
      en?: string;
      ar?: string;
    };
    metaDescription?: {
      en?: string;
      ar?: string;
    };
    keywords?: {
      en?: string[];
      ar?: string[];
    };
  };
  products: Array<{
    productId: Product | string;
    order: number;
    featured: boolean;
    addedAt: Date | string;
    _id: string;
    id: string;
  }>;
  activeProducts?: Array<{
    productId: Product;
    order: number;
    featured: boolean;
    addedAt: Date | string;
    _id: string;
    id: string;
  }>;
  productCount?: number;
  isActive: boolean;
  order: number;
  createdBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  __v?: number;
}

