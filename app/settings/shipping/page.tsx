"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Truck, Clock, DollarSign, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { shippingRatesService, type ShippingRate } from "@/services/rates"

export default function ShippingRatesPage() {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    deliveredType: "",
    productType: "",
    productName: "",
    price: "",
    deliveryTimeMin: "",
    deliveryTimeMax: "",
  })

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadShippingRates()
  }, [])

  const loadShippingRates = async () => {
    try {
      setLoading(true)
      const rates = await shippingRatesService.getAll({
        dimensiones: {
          weight: 1,
          length: 1,
          width: 1,
          height: 1,
        },
        codigoPostal: "1000",
        tipoEntregaServicio: "Domicilio",
      })
      console.log("Respuesta de rates:", rates)
      setShippingRates(rates.rates)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las tarifas de envío",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("editingRate:", editingRate)
    try {
      const rateData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        deliveryTimeMin: formData.deliveryTimeMin,
        deliveryTimeMax: formData.deliveryTimeMax,
      }

      if (editingRate && editingRate._id) {
        await shippingRatesService.update(editingRate._id, rateData)
        toast({
          title: "Éxito",
          description: "Tarifa actualizada correctamente",
        })
      } else {
        await shippingRatesService.create(rateData)
        toast({
          title: "Éxito",
          description: "Tarifa creada correctamente",
        })
      }

      setIsDialogOpen(false)
      setEditingRate(null)
      resetForm()
      loadShippingRates()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la tarifa",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (rate: ShippingRate) => {
    setEditingRate(rate)
    setFormData({
      deliveredType: rate.deliveredType,
      productType: rate.productType,
      productName: rate.productName,
      price: rate.price.toString(),
      deliveryTimeMin: rate.deliveryTimeMin,
      deliveryTimeMax: rate.deliveryTimeMax,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      deliveredType: "",
      productType: "",
      productName: "",
      price: "",
      deliveryTimeMin: "",
      deliveryTimeMax: "",
    })
  }

  const openCreateDialog = () => {
    setEditingRate(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredRates = shippingRates
  console.log("filteredRates:", filteredRates)

  const getDeliveryTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "domicilio":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "a sucursal":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await shippingRatesService.delete(deleteId)
      toast({
        title: "Éxito",
        description: "Tarifa eliminada correctamente",
      })
      loadShippingRates()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarifa",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando tarifas de envío...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screentext-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tarifas de Envío</h1>
              <p className="text-white">Gestiona las tarifas y opciones de envío</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="bg-[#DE1A32] hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarifa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-transparent border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Tarifas</CardTitle>
              <Package className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{shippingRates.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-transparent border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Precio Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                $
                {shippingRates.length > 0
                  ? (shippingRates.reduce((acc, rate) => acc + rate.price, 0) / shippingRates.length).toLocaleString(
                      "es-AR",
                    )
                  : "0"}{" "}
                ARS
              </div>
            </CardContent>
          </Card>

          <Card className="bg-transparent border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {shippingRates.length > 0
                  ? Math.round(
                      shippingRates.reduce(
                        (acc, rate) =>
                          acc + (Number.parseInt(rate.deliveryTimeMin) + Number.parseInt(rate.deliveryTimeMax)) / 2,
                        0,
                      ) / shippingRates.length,
                    )
                  : "0"}{" "}
                días
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
            <Input
              placeholder="Buscar tarifas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-gray-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className={viewMode === "cards" ? "bg-[#DE1A32] hover:bg-orange-600 text-white" : ""}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-[#DE1A32] hover:bg-orange-600" : ""}
            >
              Tabla
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRates.map((rate) => (
              <Card key={rate._id} className="bg-transparent border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getDeliveryTypeColor(rate.deliveredType)}>{rate.deliveredType}</Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(rate)}
                        className="h-8 w-8 p-0 hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(rate._id)}
                        className="h-8 w-8 p-0 hover:bg-red-900/20 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white">{rate.productName}</CardTitle>
                  <CardDescription className="text-gray-400">{rate.productType}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Precio:</span>
                    <span className="text-xl font-bold text-green-400">${rate.price.toLocaleString("es-AR")} ARS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tiempo de entrega:</span>
                    <span className="text-white">
                      {rate.deliveryTimeMin} - {rate.deliveryTimeMax} días
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-transparent border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Producto</TableHead>
                  <TableHead className="text-gray-400">Tipo</TableHead>
                  <TableHead className="text-gray-400">Entrega</TableHead>
                  <TableHead className="text-gray-400">Precio</TableHead>
                  <TableHead className="text-gray-400">Tiempo</TableHead>
                  <TableHead className="text-gray-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRates.map((rate) => (
                  <TableRow key={rate._id} className="border-gray-800">
                    <TableCell className="text-white font-medium">{rate.productName}</TableCell>
                    <TableCell className="text-gray-300">{rate.productType}</TableCell>
                    <TableCell>
                      <Badge className={getDeliveryTypeColor(rate.deliveredType)}>{rate.deliveredType}</Badge>
                    </TableCell>
                    <TableCell className="text-green-400 font-medium">
                      ${rate.price.toLocaleString("es-AR")} ARS
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {rate.deliveryTimeMin} - {rate.deliveryTimeMax} días
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(rate)}
                          className="h-8 w-8 p-0 hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(rate._id)}
                          className="h-8 w-8 p-0 hover:bg-red-900/20 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#09090B] border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>{editingRate ? "Editar Tarifa" : "Nueva Tarifa de Envío"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingRate ? "Modifica los datos de la tarifa" : "Completa los datos para crear una nueva tarifa"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveredType">Tipo de Entrega</Label>
                  <Select
                    value={formData.deliveredType}
                    onValueChange={(value) => setFormData({ ...formData, deliveredType: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Domicilio">Domicilio</SelectItem>
                      <SelectItem value="A sucursal">A sucursal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de Producto</Label>
                  <Input
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="ej: Envío Clásico"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Nombre del Producto</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                  placeholder="ej: Andreani"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio (ARS)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                  placeholder="ej: 9500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeMin">Tiempo Mínimo (días)</Label>
                  <Input
                    id="deliveryTimeMin"
                    value={formData.deliveryTimeMin}
                    onChange={(e) => setFormData({ ...formData, deliveryTimeMin: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="ej: 2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeMax">Tiempo Máximo (días)</Label>
                  <Input
                    id="deliveryTimeMax"
                    value={formData.deliveryTimeMax}
                    onChange={(e) => setFormData({ ...formData, deliveryTimeMax: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="ej: 5"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-700"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#DE1A32] text-white hover:bg-orange-600">
                  {editingRate ? "Actualizar" : "Crear"} Tarifa
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-[#09090B] border border-gray-800 text-white max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">¿Eliminar tarifa?</DialogTitle>
              <div className="flex items-center gap-3 mt-2 mb-4">
                <Trash2 className="h-7 w-7 text-red-500" />
                <span className="text-gray-400 text-lg">Esta acción no se puede deshacer.</span>
              </div>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-gray-700 px-6 py-2 text-lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-[#DE1A32] text-white hover:bg-orange-600 px-6 py-2 text-lg"
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
