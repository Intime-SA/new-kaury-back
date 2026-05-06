"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
} from "lucide-react"

interface ImportAnalyzeModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  analysis: {
    totalItems: number
    itemsToUpdate: any[]
    itemsNotFound: any[]
    itemsUnchanged: any[]
    summary: {
      totalPriceChanges: number
      totalStockChanges: number
      totalNotFound: number
      totalUnchanged: number
      totalToUpdate: number
    }
  }
  importLoading?: boolean
}

export const ImportAnalyzeModal: React.FC<ImportAnalyzeModalProps> = ({ open, onClose, onConfirm, analysis, importLoading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value)
  }

  const getChangeIcon = (oldValue: number, newValue: number) => {
    if (newValue > oldValue) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (newValue < oldValue) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <ArrowRight className="h-4 w-4 text-gray-500" />
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-pop">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>Análisis de importación</DialogTitle>
              <DialogDescription>Revisá los cambios que se aplicarán antes de confirmar</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto">
          {/* Resumen con Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.totalItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Para Actualizar</CardTitle>
                <RefreshCw className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{analysis.summary.totalToUpdate}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Cambios</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analysis.summary.totalUnchanged}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Encontrados</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{analysis.summary.totalNotFound}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detalles de Cambios */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base">Cambios de Precio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{analysis.summary.totalPriceChanges}</div>
                <p className="text-xs text-muted-foreground mt-1">productos con precio actualizado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Cambios de Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{analysis.summary.totalStockChanges}</div>
                <p className="text-xs text-muted-foreground mt-1">productos con stock actualizado</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs para diferentes categorías */}
          <Tabs defaultValue="toUpdate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="toUpdate" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Para Actualizar ({analysis.summary.totalToUpdate})
              </TabsTrigger>
              <TabsTrigger value="notFound" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No Encontrados ({analysis.summary.totalNotFound})
              </TabsTrigger>
              <TabsTrigger value="unchanged" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Sin Cambios ({analysis.summary.totalUnchanged})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="toUpdate" className="space-y-4">
              {analysis.itemsToUpdate.length > 0 ? (
                <div className="border rounded-lg max-h-[400px] overflow-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Artículo</TableHead>
                        <TableHead>Cambio de Precio</TableHead>
                        <TableHead>Cambio de Stock</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysis.itemsToUpdate.map((item: any) => (
                        <TableRow key={item.id_articulo}>
                          <TableCell className="font-medium">#{item.id_articulo}</TableCell>
                          <TableCell>
                            {item.changes.price ? (
                              <div className="flex items-center gap-2">
                                {getChangeIcon(item.changes.price.from, item.changes.price.to)}
                                <span className="text-sm">
                                  {formatCurrency(item.changes.price.from)} →{" "}
                                  <span className="font-semibold">{formatCurrency(item.changes.price.to)}</span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Sin cambios</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.changes.stock ? (
                              <div className="flex items-center gap-2">
                                {getChangeIcon(item.changes.stock.from, item.changes.stock.to)}
                                <span className="text-sm">
                                  {item.changes.stock.from} →{" "}
                                  <span className="font-semibold">{item.changes.stock.to}</span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Sin cambios</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="warning">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay items para actualizar</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notFound" className="space-y-4">
              {analysis.itemsNotFound.length > 0 ? (
                <div className="border rounded-lg max-h-[400px] overflow-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Artículo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Descripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysis.itemsNotFound.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">#{item.id_articulo}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              No encontrado
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Este artículo no existe en la base de datos
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Todos los artículos fueron encontrados</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unchanged" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>{analysis.summary.totalUnchanged} artículos sin cambios</p>
                <p className="text-sm">Estos productos ya tienen los valores correctos</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant="gradient"
            disabled={analysis.summary.totalToUpdate === 0 || importLoading}
            className="gap-2"
          >
            {importLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Importando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Confirmar e importar ({analysis.summary.totalToUpdate})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportAnalyzeModal
