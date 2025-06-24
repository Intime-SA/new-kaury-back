"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react"

interface BatchProgressModalProps {
  open: boolean
  onClose: () => void
  jobId: string | null
  jobData: any
  isLoading: boolean
}

export function BatchProgressModal({ 
  open, 
  onClose, 
  jobId, 
  jobData, 
  isLoading 
}: BatchProgressModalProps) {
  const job = jobData?.job;
  const progress = job?.progress || 0;

  const getStatusIcon = () => {
    switch (job?.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'processing':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (job?.status) {
      case 'pending':
        return 'Pendiente'
      case 'processing':
        return 'Procesando'
      case 'completed':
        return 'Completado'
      case 'failed':
        return 'Falló'
      default:
        return 'Desconocido'
    }
  }

  const getStatusColor = () => {
    switch (job?.status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Progreso de Importación
          </DialogTitle>
          <DialogDescription>
            {jobId && `Job ID: ${jobId}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado del job */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Estadísticas */}
          {job && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total items:</span>
                <div className="font-medium">{job.totalItems}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Procesados:</span>
                <div className="font-medium">{job.processedItems}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Actualizados:</span>
                <div className="font-medium">{job.results?.updated || 0}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Errores:</span>
                <div className="font-medium text-red-600">{job.results?.errors?.length || 0}</div>
              </div>
            </div>
          )}

          {/* Información de batches */}
          {job && job.batches > 1 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Batch:</span>
              <div className="font-medium">
                {job.currentBatch} de {job.batches}
              </div>
            </div>
          )}

          {/* Errores recientes */}
          {job?.results?.errors && job.results.errors.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-red-600">Errores recientes:</span>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {job.results.errors.slice(-5).map((error: string, index: number) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de cerrar cuando esté completado */}
          {(job?.status === 'completed' || job?.status === 'failed') && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 