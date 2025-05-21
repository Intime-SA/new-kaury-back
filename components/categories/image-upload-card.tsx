import { cn } from "@/lib/utils"
import { Image, Upload, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRef, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { uploadImageToR2 } from "@/lib/upload-cdn"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImageUploadCardProps {
  imageUrl: string | null
  onImageChange: (url: string | null) => void
  className?: string
}

export function ImageUploadCard({ imageUrl, onImageChange, className }: ImageUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault() // Prevenir el comportamiento por defecto
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
      // Subir a Cloudflare R2 en carpeta 'categories'
      const uploadResult = await uploadImageToR2(file)
      onImageChange(uploadResult.originalUrl)
      toast({
        title: "Imagen subida",
        description: "Imagen optimizada y subida a Cloudflare.",
      })
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(`Error: ${errorMessage}`)
      toast({
        title: "Error",
        description: `No se pudo subir la imagen. ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir el comportamiento por defecto
    fileInputRef.current?.click()
  }

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
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  onImageChange(null)
                }}
              >
                Eliminar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleButtonClick}
                disabled={isUploading}
              >
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted transition-colors"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              Haz clic para subir una imagen
            </span>
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 