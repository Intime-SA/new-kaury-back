"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { initializeApp } from "firebase/app"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"

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
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        addLog("Error: NEXT_PUBLIC_FIREBASE_API_KEY no está definida")
        throw new Error("Falta configuración de Firebase")
      }

      // Configuración de Firebase
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      addLog("Inicializando Firebase...")
      const app = initializeApp(firebaseConfig)
      const storage = getStorage(app)
      addLog("Firebase inicializado correctamente")

      // Generar nombre único
      const filename = `test-${uuidv4()}.${file.name.split(".").pop()}`
      const storagePath = `test/${filename}`
      addLog(`Subiendo a: ${storagePath}`)

      // Crear referencia
      const storageRef = ref(storage, storagePath)

      // Subir archivo
      addLog("Iniciando subida...")
      const uploadResult = await uploadBytes(storageRef, file)
      addLog(`Subida completada: ${uploadResult.metadata.fullPath}`)

      // Obtener URL
      const url = await getDownloadURL(storageRef)
      addLog(`URL obtenida: ${url}`)
      setUploadedUrl(url)

      toast({
        title: "Subida exitosa",
        description: "El archivo se ha subido correctamente a Firebase Storage",
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
        <h3 className="text-lg font-semibold mb-4">Prueba Simple de Subida a Firebase</h3>

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
