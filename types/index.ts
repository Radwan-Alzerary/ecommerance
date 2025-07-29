export interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  image: {url:string};
  category: Category;
  rating: number;
  description: string;
  colors: string[];
  sizes: string[];
  dateAdded: string;
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
  id: number;
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
  isActive?: boolean;
  order?: number;
}

