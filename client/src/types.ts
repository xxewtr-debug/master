export interface Product {
    id: number;
    name: string;
    category: 'men' | 'women' | 'kids' | 'sports';
    price: number;
    rating: number;
    image: string;
    images?: string[] | null;
    description: string;
    isNew?: boolean;
    inStock?: boolean;
    sizes?: number[];
}

export interface CartItem extends Product {
    quantity: number;
}

export type Page = 'home' | 'products' | 'about' | 'contact' | 'product-details' | 'admin';

export interface ToastMessage {
    id: number;
    text: string;
    type: 'success' | 'error' | 'info';
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating';

export interface Order {
    id: string;
    customerName: string;
    date: string;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    itemsCount: number;
    location: string;
}