"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, X, Check, Loader2 } from "lucide-react"

interface ImportProductsSectionProps {
  onFileSelected: (file: File) => void
  onConfirm: () => void
  onClear: () => void
  selectedFile: File | null
  rowsReadyCount: number
  analyzeLoading?: boolean
  analyzeData?: any
}

export function ImportProductsSection({
  onFileSelected,
  onConfirm,
  onClear,
  selectedFile,
  rowsReadyCount,
  analyzeLoading,
}: ImportProductsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0])
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Carga masiva de productos</p>
          <p className="text-xs text-muted-foreground">
            Subí un archivo Excel para actualizar precios y stock en lote
          </p>
        </div>

        {!selectedFile ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-foreground">
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[160px] truncate font-medium">{selectedFile.name}</span>
              <span className="ml-1 inline-flex h-4 items-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                {rowsReadyCount} filas
              </span>
            </div>
            <Button
              size="sm"
              variant="gradient"
              onClick={onConfirm}
              disabled={rowsReadyCount === 0 || analyzeLoading}
              className="gap-1.5"
            >
              {analyzeLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Analizar
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClear}
              className="h-8 w-8"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        ref={fileInputRef}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}

export default ImportProductsSection
