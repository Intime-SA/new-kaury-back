"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, AlertCircle } from "lucide-react"
import type { ProductImage } from "@/types/types"
import { toast } from "@/components/ui/use-toast"
import { uploadImageToFirebase, createProductImage } from "@/lib/image-processor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import { addImage } from "@/store/slices/productsSlice"

export function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useDispatch()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setError(null)

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: `${file.name} no es una imagen válida`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      console.log("Iniciando procesamiento y subida...")
      const uploadResult = await uploadImageToFirebase(file)
      console.log(`Procesamiento completado. URL original: ${uploadResult.originalUrl}, Filename: ${uploadResult.filename}`)

      const newImage = createProductImage(uploadResult, 0)

      dispatch(addImage(newImage))

      toast({
        title: "Imagen subida",
        description: "Imagen optimizada y añadida al estado.",
      })

    } catch (error) {
      console.error("Error al procesar o subir la imagen:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(`Error: ${errorMessage}`)
      toast({
        title: "Error",
        description: `No se pudo procesar o subir la imagen. ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center border-muted-foreground/25">
        <div className="flex flex-col items-center justify-center gap-4">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <h3 className="text-lg font-medium">Optimizando y subiendo...</h3>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">Subir Imagen</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona una imagen. Se optimizará automáticamente.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Seleccionar archivo
              </Button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- Eliminar Sección de Previsualización de Imágenes Adicionales --- */}
      {/* Ya no es necesaria aquí, ImagesSection la maneja */}
      {/* {images.length > 1 && ( ... )} */}

    </div>
  )
}
