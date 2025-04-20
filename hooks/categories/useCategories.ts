import { useMutation, useQuery, useQueryClient } from "react-query"
import { toast } from "@/components/ui/use-toast"

interface CategoryName {
  es: string
}

export interface Category {
  id: string
  name: CategoryName
  description?: { es: string }
  subcategories: Category[]
  visible: boolean
  image: string | null
}

interface CategoryInput {
  name: CategoryName
  description?: { es: string }
  visible?: boolean
  image?: string | null
}

interface ApiResponse<T> {
  status: string
  data: T
}

interface ApiError {
  message: string
}

const CATEGORIES_KEY = "categories"

async function fetchCategories(visible?: boolean): Promise<Category[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, window.location.origin)
  if (visible !== undefined) {
    url.searchParams.append("visible", visible.toString())
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Error al obtener las categorías")
  }
  
  const { data } = await response.json() as ApiResponse<Category[]>
  return data
}

async function createCategory(categoryData: CategoryInput): Promise<Category> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  })
  
  if (!response.ok) {
    throw new Error("Error al crear la categoría")
  }
  
  const { data } = await response.json() as ApiResponse<Category>
  return data
}

async function updateCategory(id: string, categoryData: CategoryInput): Promise<Category> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  })
  
  if (!response.ok) {
    throw new Error("Error al actualizar la categoría")
  }
  
  const { data } = await response.json() as ApiResponse<Category>
  return data
}

async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
  })
  
  if (!response.ok) {
    throw new Error("Error al eliminar la categoría")
  }
}

async function createSubcategory(parentId: string, subcategoryData: CategoryInput): Promise<Category> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${parentId}/subcategories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subcategoryData),
  })
  
  if (!response.ok) {
    throw new Error("Error al crear la subcategoría")
  }
  
  const { data } = await response.json() as ApiResponse<Category>
  return data
}

async function deleteSubcategory(parentId: string, subcategoryId: string): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${parentId}/subcategories/${subcategoryId}`, {
    method: "DELETE",
  })
  
  if (!response.ok) {
    throw new Error("Error al eliminar la subcategoría")
  }
}

async function updateSubcategory(parentId: string, subcategoryId: string, categoryData: CategoryInput): Promise<Category> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${parentId}/subcategories/${subcategoryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  })
  
  if (!response.ok) {
    throw new Error("Error al actualizar la subcategoría")
  }
  
  const { data } = await response.json() as ApiResponse<Category>
  return data
}

export function useCategories(visible?: boolean) {
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: [CATEGORIES_KEY, { visible }],
    queryFn: () => fetchCategories(visible),
  })

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      toast({
        title: "Éxito",
        description: "Categoría creada correctamente",
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, parentId, ...data }: CategoryInput & { id: string; parentId?: string }) => {
      if (parentId) {
        return updateSubcategory(parentId, id, data)
      }
      return updateCategory(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente",
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const createSubcategoryMutation = useMutation({
    mutationFn: ({ parentId, ...data }: CategoryInput & { parentId: string }) =>
      createSubcategory(parentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      toast({
        title: "Éxito",
        description: "Subcategoría creada correctamente",
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const deleteSubcategoryMutation = useMutation({
    mutationFn: ({ parentId, subcategoryId }: { parentId: string; subcategoryId: string }) =>
      deleteSubcategory(parentId, subcategoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      toast({
        title: "Éxito",
        description: "Subcategoría eliminada correctamente",
      })
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    categories,
    isLoading,
    error,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    createSubcategory: createSubcategoryMutation.mutate,
    deleteSubcategory: deleteSubcategoryMutation.mutate,
  }
} 