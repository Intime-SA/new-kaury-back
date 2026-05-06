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
import { CheckCircle, AlertCircle, Loader2, Clock, Package } from "lucide-react"

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
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
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
        return 'bg-success/10 text-success'
      case 'failed':
        return 'bg-destructive/10 text-destructive'
      case 'processing':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-muted text-muted-foreground'
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
              <span>Progreso General</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Información de batches */}
          {job && job.batches > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4" />
                Progreso de Batches
              </div>
              <div className="flex justify-between text-sm">
                <span>Batch actual:</span>
                <span className="font-medium">{job.currentBatch} de {job.batches}</span>
              </div>
              <Progress 
                value={(job.currentBatch / job.batches) * 100} 
                className="w-full h-2" 
              />
            </div>
          )}

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

          {/* Información adicional de batches */}
          {job && job.batches > 1 && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <div className="font-medium mb-1">Información de Batches:</div>
              <div>• Tamaño de batch: 200 items</div>
              <div>• Batch actual: {job.currentBatch}</div>
              <div>• Total de batches: {job.batches}</div>
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