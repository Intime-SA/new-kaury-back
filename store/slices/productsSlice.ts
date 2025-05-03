import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ProductImage, ProductVariant, ProductCategory } from '@/types/types'

export interface SelectedCategory {
  id: string
  name: {
    es: string
  }
  parentId?: string
}

export interface ProductFormState {
  name: {
    es: string
  }
  description: {
    es: string
  }
  freeShipping: boolean
  productType: 'physical' | 'digital'
  stockManagement: 'infinite' | 'limited'
  images: ProductImage[]
  variants: ProductVariant[]
  categories: SelectedCategory[]
  tags: string[]
  urls: {
    videoURL: string | null
  }
  sku?: string
  barcode?: string
  dimensions?: {
    weight: string
    width: string
    height: string
    depth: string
  }
  mpn?: string
  ageRange?: string
  gender?: string
  showInStore: boolean
}

export const initialState: ProductFormState = {
  name: {
    es: ''
  },
  description: {
    es: ''
  },
  freeShipping: false,
  productType: 'physical',
  stockManagement: 'limited',
  images: [],
  variants: [],
  categories: [],
  tags: [],
  urls: {
    videoURL: null
  },
  sku: '',
  barcode: '',
  dimensions: {
    weight: '',
    width: '',
    height: '',
    depth: ''
  },
  mpn: '',
  ageRange: '',
  gender: '',
  showInStore: true
}

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductName: (state, action: PayloadAction<{ es: string }>) => {
      state.name = action.payload
    },
    setProductDescription: (state, action: PayloadAction<{ es: string }>) => {
      state.description = action.payload
    },
    setFreeShipping: (state, action: PayloadAction<boolean>) => {
      state.freeShipping = action.payload
    },
    setProductType: (state, action: PayloadAction<"physical" | "digital">) => {
      state.productType = action.payload
    },
    setStockManagement: (state, action: PayloadAction<"infinite" | "limited">) => {
      state.stockManagement = action.payload
    },
    setImages: (state, action: PayloadAction<ProductImage[]>) => {
      state.images = action.payload
    },
    addImage: (state, action: PayloadAction<ProductImage>) => {
      state.images.push(action.payload)
    },
    removeImage: (state, action: PayloadAction<string | number>) => {
      state.images = state.images.filter(img => img.id !== action.payload)
    },
    reorderImages: (state, action: PayloadAction<ProductImage[]>) => {
      state.images = action.payload
    },
    setVariants: (state, action: PayloadAction<ProductVariant[]>) => {
      state.variants = action.payload
    },
    addVariant: (state, action: PayloadAction<ProductVariant>) => {
      state.variants.push(action.payload)
    },
    updateVariant: (state, action: PayloadAction<{ index: number; variant: ProductVariant }>) => {
      state.variants[action.payload.index] = action.payload.variant
    },
    removeVariant: (state, action: PayloadAction<number>) => {
      state.variants.splice(action.payload, 1)
    },
    setCategories: (state, action: PayloadAction<SelectedCategory[]>) => {
      state.categories = action.payload
    },
    addCategory: (state, action: PayloadAction<SelectedCategory>) => {
      const categoryExists = state.categories.some(cat => cat.id === action.payload.id)
      if (!categoryExists) {
        state.categories.push(action.payload)
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload)
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload
    },
    setVideoURL: (state, action: PayloadAction<string | null>) => {
      state.urls.videoURL = action.payload
    },
    setSKU: (state, action: PayloadAction<string>) => {
      state.sku = action.payload
    },
    setBarcode: (state, action: PayloadAction<string>) => {
      state.barcode = action.payload
    },
    setDimensions: (state, action: PayloadAction<{
      weight: string
      width: string
      height: string
      depth: string
    }>) => {
      if (state.dimensions) {
        state.dimensions = { ...state.dimensions, ...action.payload }
      } else {
        state.dimensions = action.payload
      }
    },
    setMPN: (state, action: PayloadAction<string>) => {
      state.mpn = action.payload
    },
    setAgeRange: (state, action: PayloadAction<string>) => {
      state.ageRange = action.payload
    },
    setGender: (state, action: PayloadAction<string>) => {
      state.gender = action.payload
    },
    setShowInStore: (state, action: PayloadAction<boolean>) => {
      state.showInStore = action.payload
    },
    resetForm: (state) => {
      return initialState
    },
    setFormData: (state, action: PayloadAction<Partial<ProductFormState>>) => {
      return { ...state, ...action.payload }
    }
  }
})

export const {
  setProductName,
  setProductDescription,
  setFreeShipping,
  setProductType,
  setStockManagement,
  setImages,
  addImage,
  removeImage,
  reorderImages,
  setVariants,
  addVariant,
  updateVariant,
  removeVariant,
  setCategories,
  addCategory,
  removeCategory,
  setTags,
  setVideoURL,
  setSKU,
  setBarcode,
  setDimensions,
  setMPN,
  setAgeRange,
  setGender,
  setShowInStore,
  resetForm,
  setFormData
} = productsSlice.actions

export default productsSlice.reducer 