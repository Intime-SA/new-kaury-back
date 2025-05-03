"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { uploadImageToR2 } from "@/lib/upload-cdn" // Importar la función de utilidad

export function SimpleUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setIsUploading(true)
    setUploadedUrl(null)
    setLogs([])

    try {
      addLog(`Archivo seleccionado: ${file.name} (${file.type}, ${file.size} bytes)`)

      // Verificar variables de entorno
      if (!process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL) {
        addLog("Error: NEXT_PUBLIC_CLOUDFLARE_CDN_URL no está definida")
        throw new Error("Falta configuración de Cloudflare")
      }
      
      addLog("Preparando subida a Cloudflare R2...")
      
      // Usar la función de utilidad para subir a R2
      addLog("Iniciando subida a través de la API route...")
      const result = await uploadImageToR2(file)
      
      addLog(`Subida completada. ID: ${result.filename}`)
      
      // Obtener URL
      const url = result.originalUrl
      addLog(`URL obtenida: ${url}`)
      setUploadedUrl(url)
      
      // Mostrar información sobre los diferentes tamaños
      addLog(`URL pequeña: ${result.sizes.small}`)
      addLog(`URL mediana: ${result.sizes.medium}`)
      addLog(`URL grande: ${result.sizes.large}`)

      toast({
        title: "Subida exitosa",
        description: "El archivo se ha subido correctamente a Cloudflare R2",
      })
    } catch (error) {
      console.error("Error al subir:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      addLog(`ERROR: ${errorMessage}`)

      toast({
        title: "Error de subida",
        description: errorMessage,
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
      <div className="border-2 border-dashed rounded-lg p-6 text-center border-muted-foreground/25">
        <h3 className="text-lg font-semibold mb-4">Prueba Simple de Subida a Cloudflare R2</h3>

        <div className="flex justify-center mb-4">
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} variant="outline">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Seleccionar archivo"
            )}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>

        {logs.length > 0 && (
          <div className="bg-muted p-3 rounded-md text-xs font-mono text-left whitespace-pre-wrap overflow-auto max-h-60">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        )}

        {uploadedUrl && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Imagen subida:</h4>
            <img
              src={uploadedUrl || "/placeholder.svg"}
              alt="Imagen subida"
              className="max-w-full max-h-60 mx-auto rounded-md"
            />
            <p className="text-xs mt-2 break-all">{uploadedUrl}</p>
          </div>
        )}
      </div>
    </div>
  )
}