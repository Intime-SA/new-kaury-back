import { cn } from "@/lib/utils"
import { Image, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ImageUploadCardProps {
  imageUrl: string | null
  onImageChange: (url: string | null) => void
  className?: string
}

export function ImageUploadCard({ imageUrl, onImageChange, className }: ImageUploadCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {imageUrl ? (
          <div className="relative group">
            <img
              src={imageUrl}
              alt="Imagen de categoría"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onImageChange(null)}
              >
                Eliminar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const newUrl = prompt("Ingresa la URL de la imagen:")
                  if (newUrl) onImageChange(newUrl)
                }}
              >
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <button
            className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted transition-colors"
            onClick={() => {
              const url = prompt("Ingresa la URL de la imagen:")
              if (url) onImageChange(url)
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Haz clic para agregar una imagen
            </span>
          </button>
        )}
      </CardContent>
    </Card>
  )
} 