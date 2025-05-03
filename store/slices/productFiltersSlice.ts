// Este archivo es una sugerencia de cómo modificar tu slice existente
// para incluir el filtro por nombre de producto

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store" // Ajusta según tu estructura

// Actualizar la interfaz ProductFiltersState para incluir productName
export interface ProductFiltersState {
  minPrice: number | null
  maxPrice: number | null
  inStock: boolean | null // true: solo con stock, false: solo sin stock, null: todos
  createdAtFrom: string | null // Fecha en formato ISO string (YYYY-MM-DD) o null
  createdAtTo: string | null // Fecha en formato ISO string (YYYY-MM-DD) o null
  updatedAtFrom: string | null // Fecha en formato ISO string (YYYY-MM-DD) o null
  updatedAtTo: string | null // Fecha en formato ISO string (YYYY-MM-DD) o null
  productName: string | null // Nuevo campo para búsqueda por nombre
}

// Actualizar el estado inicial para incluir productName
const initialState: ProductFiltersState = {
  minPrice: null,
  maxPrice: null,
  inStock: null,
  createdAtFrom: null,
  createdAtTo: null,
  updatedAtFrom: null,
  updatedAtTo: null,
  productName: null,
}

// En el objeto reducers, añadir una nueva acción para establecer el nombre del producto
const productFiltersSlice = createSlice({
  name: "productFilters",
  initialState,
  reducers: {
    // Mantener las acciones existentes...
    setPriceRange: (state, action: PayloadAction<{ min?: number | null; max?: number | null }>) => {
      if (action.payload.min !== undefined) {
        state.minPrice = action.payload.min
      }
      if (action.payload.max !== undefined) {
        state.maxPrice = action.payload.max
      }
    },
    setStockStatus: (state, action: PayloadAction<boolean | null>) => {
      state.inStock = action.payload
    },
    setCreationDateRange: (state, action: PayloadAction<{ from?: string | null; to?: string | null }>) => {
      if (action.payload.from !== undefined) {
        state.createdAtFrom = action.payload.from
      }
      if (action.payload.to !== undefined) {
        state.createdAtTo = action.payload.to
      }
    },
    setUpdateDateRange: (state, action: PayloadAction<{ from?: string | null; to?: string | null }>) => {
      if (action.payload.from !== undefined) {
        state.updatedAtFrom = action.payload.from
      }
      if (action.payload.to !== undefined) {
        state.updatedAtTo = action.payload.to
      }
    },
    // Nueva acción para establecer el nombre del producto
    setProductName: (state, action: PayloadAction<string | null>) => {
      state.productName = action.payload
    },
    // Actualizar clearFilter para manejar el nuevo campo productName
    clearFilter: (
      state,
      action: PayloadAction<keyof ProductFiltersState | "price" | "creationDate" | "updateDate" | "productName">,
    ) => {
      const filterToClear = action.payload
      if (filterToClear === "price" || filterToClear === "minPrice" || filterToClear === "maxPrice") {
        state.minPrice = null
        state.maxPrice = null
      } else if (
        filterToClear === "creationDate" ||
        filterToClear === "createdAtFrom" ||
        filterToClear === "createdAtTo"
      ) {
        state.createdAtFrom = null
        state.createdAtTo = null
      } else if (
        filterToClear === "updateDate" ||
        filterToClear === "updatedAtFrom" ||
        filterToClear === "updatedAtTo"
      ) {
        state.updatedAtFrom = null
        state.updatedAtTo = null
      } else if (filterToClear === "inStock") {
        state.inStock = null
      } else if (filterToClear === "productName") {
        state.productName = null
      }
    },
    resetFilters: () => initialState,
  },
})

// Actualizar las acciones exportadas para incluir setProductName
export const {
  setPriceRange,
  setStockStatus,
  setCreationDateRange,
  setUpdateDateRange,
  setProductName,
  clearFilter,
  resetFilters,
} = productFiltersSlice.actions

// Los selectores existentes funcionarán con el nuevo campo sin cambios
export const selectProductFilters = (state: RootState): ProductFiltersState => state.productFilters

export const selectIsAnyFilterActive = (state: RootState): boolean => {
  const filters = state.productFilters
  // Verifica si algún valor en el objeto de filtros no es null
  return Object.values(filters).some((value) => value !== null)
}

export default productFiltersSlice.reducer
