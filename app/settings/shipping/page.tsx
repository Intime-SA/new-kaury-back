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
        dimensiones: { weight: 1, length: 1, width: 1, height: 1 },
        codigoPostal: "1000",
        tipoEntregaServicio: "Domicilio",
      })
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
    try {
      const rateData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        deliveryTimeMin: formData.deliveryTimeMin,
        deliveryTimeMax: formData.deliveryTimeMax,
      }

      if (editingRate && editingRate._id) {
        await shippingRatesService.update(editingRate._id, rateData)
        toast({ title: "Éxito", description: "Tarifa actualizada correctamente" })
      } else {
        await shippingRatesService.create(rateData)
        toast({ title: "Éxito", description: "Tarifa creada correctamente" })
      }

      setIsDialogOpen(false)
      setEditingRate(null)
      resetForm()
      loadShippingRates()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la tarifa", variant: "destructive" })
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

  const filteredRates = shippingRates.filter(
    (r) =>
      !searchTerm ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.deliveredType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDeliveryTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "domicilio":
        return "info"
      case "a sucursal":
        return "success"
      default:
        return "soft"
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await shippingRatesService.delete(deleteId)
      toast({ title: "Éxito", description: "Tarifa eliminada correctamente" })
      loadShippingRates()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la tarifa", variant: "destructive" })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const stats = {
    total: shippingRates.length,
    avgPrice:
      shippingRates.length > 0
        ? Math.round(shippingRates.reduce((acc, r) => acc + r.price, 0) / shippingRates.length)
        : 0,
    avgDays:
      shippingRates.length > 0
        ? Math.round(
            shippingRates.reduce(
              (acc, r) => acc + (Number.parseInt(r.deliveryTimeMin) + Number.parseInt(r.deliveryTimeMax)) / 2,
              0
            ) / shippingRates.length
          )
        : 0,
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          Cargando tarifas de envío...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-pop">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Tarifas de envío</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Gestioná las tarifas y opciones de envío</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva tarifa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger">
          {[
            { title: "Total tarifas", value: stats.total, icon: Package, accent: "from-rose-500/15 to-red-500/15 text-primary" },
            { title: "Precio promedio", value: `$${stats.avgPrice.toLocaleString("es-AR")}`, icon: DollarSign, accent: "from-emerald-400/15 to-teal-500/15 text-success" },
            { title: "Tiempo promedio", value: `${stats.avgDays} días`, icon: Clock, accent: "from-sky-400/15 to-cyan-500/15 text-info" },
          ].map((s) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.title}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent}`}>
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarifas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-xl border border-border/60 bg-card">
            <Button
              variant={viewMode === "cards" ? "gradient" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "gradient" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Tabla
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRates.map((rate) => (
              <Card key={rate._id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={getDeliveryTypeBadgeVariant(rate.deliveredType)}>{rate.deliveredType}</Badge>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleEdit(rate)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(rate._id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{rate.productName}</CardTitle>
                  <CardDescription>{rate.productType}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Precio</span>
                    <span className="text-lg font-bold text-success">${rate.price.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Entrega</span>
                    <span className="text-sm font-semibold text-foreground">
                      {rate.deliveryTimeMin} – {rate.deliveryTimeMax} días
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRates.map((rate) => (
                  <TableRow key={rate._id}>
                    <TableCell className="font-semibold text-foreground">{rate.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{rate.productType}</TableCell>
                    <TableCell>
                      <Badge variant={getDeliveryTypeBadgeVariant(rate.deliveredType)}>{rate.deliveredType}</Badge>
                    </TableCell>
                    <TableCell className="text-success font-semibold">
                      ${rate.price.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {rate.deliveryTimeMin} – {rate.deliveryTimeMax} días
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(rate)} className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(rate._id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRate ? "Editar tarifa" : "Nueva tarifa de envío"}</DialogTitle>
              <DialogDescription>
                {editingRate ? "Modificá los datos de la tarifa" : "Completá los datos para crear una nueva tarifa"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveredType">Tipo de entrega</Label>
                  <Select
                    value={formData.deliveredType}
                    onValueChange={(value) => setFormData({ ...formData, deliveredType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Domicilio">Domicilio</SelectItem>
                      <SelectItem value="A sucursal">A sucursal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de producto</Label>
                  <Input
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    placeholder="ej: Envío clásico"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Nombre del producto</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
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
                  placeholder="ej: 9500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeMin">Tiempo mínimo (días)</Label>
                  <Input
                    id="deliveryTimeMin"
                    value={formData.deliveryTimeMin}
                    onChange={(e) => setFormData({ ...formData, deliveryTimeMin: e.target.value })}
                    placeholder="ej: 2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeMax">Tiempo máximo (días)</Label>
                  <Input
                    id="deliveryTimeMax"
                    value={formData.deliveryTimeMax}
                    onChange={(e) => setFormData({ ...formData, deliveryTimeMax: e.target.value })}
                    placeholder="ej: 5"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient">
                  {editingRate ? "Actualizar" : "Crear"} tarifa
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-center">¿Eliminar tarifa?</DialogTitle>
              <DialogDescription className="text-center">
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-3 sm:justify-center">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
