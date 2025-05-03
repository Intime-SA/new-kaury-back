// lib/cloudflare-r2.ts
import type { ProductImage } from "@/types/types"

// Interfaz para los resultados de subida
export interface UploadResult {
  filename: string
  originalUrl: string
  sizes: {
    small: string
    medium: string
    large: string
    original: string
  }
}

/**
 * Sube una imagen a Cloudflare R2 a través de una API route
 */
export async function uploadImageToR2(file: File): Promise<UploadResult> {
  // Crear FormData para enviar el archivo
  const formData = new FormData()
  formData.append('file', file)

  // Llamar a nuestra API route que manejará la subida a R2
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error al subir imagen: ${response.status}`)
  }

  return await response.json()
}



/**
 * Crea un objeto ProductImage a partir del resultado de la subida
 */
export function createProductImage(uploadResult: UploadResult, position: number): ProductImage {
  return {
    id: uploadResult.filename,
    url: uploadResult.originalUrl,
    position,
    alt: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    src: uploadResult.originalUrl,
    filename: uploadResult.filename,
    isUploading: false,
    product_id: 0,
  }
}