export interface ProductImage {
  id: string | number
  src: string
  filename?: string
  isUploading?: boolean
  position?: number
  product_id?: number
  url?: string
  alt?: string[]
  created_at?: string
  updated_at?: string
}

export interface ProductCategory {
  id: string
  name: {
    es: string
  }
  subcategories?: ProductCategory[]
}

export interface ProductVariant {
  id: string
  value: string
  attr: {
    [key: string]: string
  }
  stock: number | null
  stockManagement: boolean
  unit_price: number
  promotionalPrice: number | null
  imageId: string | null
  shooterCount: number
  targetCount: number
  productId: string
  sku: string
  ageGroup: string
  gender: string
  cost: number
}

export interface Product {
  id: string
  categories: ProductCategory[]
  description: {
    es: string
  }
  images: ProductImage[]
  name: {
    es: string
  }
  published: boolean
  urls: {
    canonicalURL?: string
    videoURL: string | null
  }
  variants: ProductVariant[]
  soldCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
  freeShipping: boolean
  tags: string[]
  sku?: string
  barcode?: string
  dimensions?: {
    weight?: string
    width?: string
    height?: string
    depth?: string
  }
  mpn?: string
  ageRange?: string
  gender?: string
  showInStore?: boolean
}

// --- Tipos para Filtros y Paginación de Productos --- 

// Interfaz para los parámetros que acepta tu función getProductsService
// (combina paginación y filtros)
export interface GetProductsParams {
  page?: number;
  limit?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean | null;
  createdAtFrom?: string | null;
  createdAtTo?: string | null;
  updatedAtFrom?: string | null;
  updatedAtTo?: string | null;
  category?: string | null; // Mantener otros filtros si existen
  search?: string | null;
  // Añade aquí cualquier otro parámetro que acepte tu API (sortBy, etc.)
}

// Interfaz para la respuesta paginada de la API de productos
// AJUSTA ESTA ESTRUCTURA PARA QUE COINCIDA CON TU API REAL
export interface PaginatedApiResponse<T = Product> { 
  data: T[]; // Array de datos (productos)
  pagination: {
    currentPage: number; // Número de la página actual
    totalPages: number;  // Total de páginas disponibles
    totalCount?: number; // Total de items (opcional)
    limit: number;       // Items por página
    hasNextPage: boolean; // Booleano crucial para useInfiniteQuery
    hasPrevPage?: boolean; // Booleano (opcional)
    // ... cualquier otro metadato de paginación que devuelva tu API
  };
}
