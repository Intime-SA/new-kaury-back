"use client"

import { useState, useCallback } from "react"
import { useMutation } from "react-query"

export interface ImportProduct {
  id_articulo: number
  preciolista: number
  id_Lista: number
  stock: number
}

export interface BatchImportResponse {
  success: boolean
  batch: {
    batchSize: number
    currentOffset: number
    nextOffset: number
    processedInBatch: number
    updatedInBatch: number
    errorsInBatch: number
  }
  progress: {
    totalItems: number
    processedItems: number
    remainingItems: number
    progressPercentage: number
    isComplete: boolean
  }
  summary: {
    totalProcessed: number
    totalUpdated: number
    totalErrors: number
  }
  details: Array<{
    id_articulo: number
    status: "success" | "error"
    message: string
  }>
}

export interface BatchImportProgress {
  totalItems: number
  processedItems: number
  remainingItems: number
  progressPercentage: number
  isComplete: boolean
  totalUpdated: number
  totalErrors: number
  currentBatch: number
  totalBatches: number
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const importBatch = async (items: ImportProduct[], offset: number, batchSize = 50): Promise<BatchImportResponse> => {
    const response = await fetch(`${API_URL}/products/import-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
      batchSize,
      offset,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Error en la importación por lotes")
  }

  return response.json()
}

export function useBatchImportProducts() {
  const [progress, setProgress] = useState<BatchImportProgress | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [allDetails, setAllDetails] = useState<Array<any>>([])

  const batchMutation = useMutation({
    mutationFn: ({ items, offset, batchSize }: { items: ImportProduct[]; offset: number; batchSize: number }) =>
      importBatch(items, offset, batchSize),
  })

  const startBatchImport = useCallback(
    async (
      items: ImportProduct[],
      batchSize = 200,
      onProgress?: (progress: BatchImportProgress) => void,
      onComplete?: (finalProgress: BatchImportProgress, allDetails: Array<any>) => void,
      onError?: (error: Error) => void,
    ) => {
      setIsImporting(true)
      setAllDetails([])

      const totalBatches = Math.ceil(items.length / batchSize)
      let currentOffset = 0
      let totalUpdated = 0
      let totalErrors = 0
      let currentBatch = 1
      const accumulatedDetails: Array<any> = []

      try {
        while (currentOffset < items.length) {
          const response = await batchMutation.mutateAsync({
            items,
            offset: currentOffset,
            batchSize,
          })

          // Acumular detalles
          accumulatedDetails.push(...response.details)
          setAllDetails((prev) => [...prev, ...response.details])

          // Acumular totales
          totalUpdated += response.summary.totalUpdated
          totalErrors += response.summary.totalErrors

          const progressData: BatchImportProgress = {
            totalItems: response.progress.totalItems,
            processedItems: response.progress.processedItems,
            remainingItems: response.progress.remainingItems,
            progressPercentage: response.progress.progressPercentage,
            isComplete: response.progress.isComplete,
            totalUpdated,
            totalErrors,
            currentBatch,
            totalBatches,
          }

          setProgress(progressData)
          onProgress?.(progressData)

          if (response.progress.isComplete) {
            onComplete?.(progressData, accumulatedDetails)
            break
          }

          currentOffset = response.batch.nextOffset
          currentBatch++
        }
      } catch (error) {
        console.error("Error en importación por lotes:", error)
        onError?.(error as Error)
      } finally {
        setIsImporting(false)
      }
    },
    [batchMutation],
  )

  const resetProgress = useCallback(() => {
    setProgress(null)
    setAllDetails([])
  }, [])

  return {
    startBatchImport,
    progress,
    isImporting,
    allDetails,
    resetProgress,
    error: batchMutation.error,
  }
}
