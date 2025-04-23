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
}
