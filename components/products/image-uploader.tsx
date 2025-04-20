"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { ProductImage } from "@/types/types"
import { toast } from "@/components/ui/use-toast"

interface ImageUploaderProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0] // Solo procesamos el primer archivo por ahora
      
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: `${file.name} no es una imagen válida`,
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage: ProductImage = {
            id: Date.now(),
            product_id: 0,
            src: e.target.result as string,
            position: images.length + 1,
            alt: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          onChange([...images, newImage])
        }
      }

      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center border-muted-foreground/25">
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Subí fotos del producto</h3>
          <p className="text-sm text-muted-foreground">
            Tamaño mínimo recomendado: 1024px / Formatos recomendados: WEBP, PNG, JPEG o GIF
          </p>
          <Button 
            type="button"
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="mt-2"
          >
            Seleccionar archivo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative aspect-square">
              <img
                src={image.src || "/placeholder.svg"}
                alt={`Producto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
