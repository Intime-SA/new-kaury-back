"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, X, Check } from "lucide-react"

interface ImportProductsSectionProps {
  onFileSelected: (file: File) => void
  onConfirm: () => void
  onClear: () => void
  selectedFile: File | null
  rowsReadyCount: number
}

export function ImportProductsSection({
  onFileSelected,
  onConfirm,
  onClear,
  selectedFile,
  rowsReadyCount,
}: ImportProductsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0])
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!selectedFile ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar Excel
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-zinc-100 bg-zinc-800 px-2 py-1 rounded">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="max-w-32 truncate">{selectedFile.name}</span>
          </div>
          <Button
            size="sm"
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 text-xs px-2"
            disabled={rowsReadyCount === 0}
          >
            <Check className="h-3 w-3 mr-1" />
            Confirmar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs px-2 text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        ref={fileInputRef}
        onChange={handleInputChange}
        className="hidden"
      />

      {selectedFile && (
        <span className="ml-2 text-xs text-zinc-400">
          {rowsReadyCount} filas listas para procesar
        </span>
      )}
    </div>
  )
}

export default ImportProductsSection
