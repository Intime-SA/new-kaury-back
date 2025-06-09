"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { type PaymentMethodResponse, paymentsService, type PaymentMethod } from "@/services/payments"

// Función para obtener el icono apropiado según el nombre del método
const getPaymentIcon = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("efectivo") || lowerName.includes("cash")) {
    return Banknote
  } else if (lowerName.includes("tarjeta") || lowerName.includes("card")) {
    return CreditCard
  } else if (lowerName.includes("mercado") || lowerName.includes("pago")) {
    return Smartphone
  } else if (lowerName.includes("transfer") || lowerName.includes("banco")) {
    return Building2
  } else {
    return Wallet
  }
}

// Función para obtener el color del método según su tipo
const getPaymentColor = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("efectivo")) {
    return "from-green-500/20 to-green-600/10 border-green-500/30"
  } else if (lowerName.includes("tarjeta")) {
    return "from-blue-500/20 to-blue-600/10 border-blue-500/30"
  } else if (lowerName.includes("mercado")) {
    return "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30"
  } else if (lowerName.includes("transfer")) {
    return "from-purple-500/20 to-purple-600/10 border-purple-500/30"
  } else {
    return "from-gray-500/20 to-gray-600/10 border-gray-500/30"
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentMethodResponse>({ methods: [] })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: 0,
    change: false,
    active: true,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const data = await paymentsService.getAll()
      setPayments(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los métodos de pago",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPayment && editingPayment._id) {
        await paymentsService.update(editingPayment._id, formData)
        toast({ title: "Éxito", description: "Método actualizado correctamente" })
      } else {
        await paymentsService.create(formData)
        toast({ title: "Éxito", description: "Método creado correctamente" })
      }
      setIsDialogOpen(false)
      setEditingPayment(null)
      resetForm()
      loadPayments()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el método", variant: "destructive" })
    }
  }

  const handleEdit = (payment: PaymentMethod) => {
    setEditingPayment(payment)
    setFormData({
      name: payment.name,
      description: payment.description,
      percentage: payment.percentage,
      change: payment.change,
      active: payment.active,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await paymentsService.delete(deleteId)
      toast({ title: "Éxito", description: "Método eliminado correctamente" })
      loadPayments()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el método", variant: "destructive" })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      percentage: 0,
      change: false,
      active: true,
    })
  }

  const openCreateDialog = () => {
    setEditingPayment(null)
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DE1A32]"></div>
            <div className="text-lg">Cargando métodos de pago...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header mejorado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#DE1A32]/20 to-orange-600/10 border border-[#DE1A32]/30">
                <Wallet className="h-8 w-8 text-[#DE1A32]" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-[#DE1A32] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{payments.methods.length}</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Métodos de Pago
              </h1>
              <p className="text-gray-400 mt-1">Gestiona los métodos de pago disponibles en tu sistema</p>
            </div>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-[#DE1A32] to-orange-600 hover:from-[#DE1A32]/90 hover:to-orange-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Método
          </Button>
        </div>

        {/* View Mode Buttons mejorados */}
        <div className="flex gap-2 justify-end mb-6">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className={`transition-all duration-300 ${
              viewMode === "cards"
                ? "bg-gradient-to-r from-[#DE1A32] to-orange-600 text-white shadow-lg"
                : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
            }`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={`transition-all duration-300 ${
              viewMode === "table"
                ? "bg-gradient-to-r from-[#DE1A32] to-orange-600 text-white shadow-lg"
                : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
            }`}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Tabla
          </Button>
        </div>

        {/* Cards mejoradas */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payments.methods.map((payment) => {
              const IconComponent = getPaymentIcon(payment.name)
              const colorClass = getPaymentColor(payment.name)

              return (
                <Card
                  key={payment._id}
                  className={`group relative overflow-hidden bg-gradient-to-br ${colorClass} backdrop-blur-sm hover:shadow-2xl hover:shadow-[#DE1A32]/10 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer`}
                >
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                            {payment.name}
                          </h3>
                          <Badge
                            variant={payment.active ? "default" : "secondary"}
                            className={`mt-1 ${
                              payment.active
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-red-500/20 text-red-300 border-red-500/30"
                            }`}
                          >
                            {payment.active ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Activo
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" /> Inactivo
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(payment)}
                          className="h-8 w-8 p-0 hover:bg-white/20 hover:text-white transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(payment._id)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{payment.description}</p>

                    {/* Información principal con iconos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Percent className="h-4 w-4 text-blue-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Comisión</span>
                        </div>
                        <span className="text-2xl font-bold text-white">{payment.percentage}%</span>
                      </div>

                      <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-orange-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Recargo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.change ? (
                            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Sí
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Switch de estado */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-sm text-gray-300">Estado del método</span>
                      <Switch
                        checked={payment.active}
                        onCheckedChange={async (checked) => {
                          await paymentsService.update(payment._id, { active: checked })
                          loadPayments()
                        }}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 font-semibold">Método</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Descripción</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Comisión</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Recargo</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Estado</TableHead>
                  <TableHead className="text-gray-300 font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.methods.map((payment: PaymentMethod) => {
                  const IconComponent = getPaymentIcon(payment.name)

                  return (
                    <TableRow key={payment._id} className="border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-gray-700/50">
                            <IconComponent className="h-4 w-4 text-gray-300" />
                          </div>
                          {payment.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{payment.description}</TableCell>
                      <TableCell className="text-gray-300">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                          {payment.percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {payment.change ? (
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Sí</Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={payment.active}
                          onCheckedChange={async (checked) => {
                            await paymentsService.update(payment._id, { active: checked })
                            loadPayments()
                          }}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(payment)}
                            className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(payment._id)}
                            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Create/Edit Dialog mejorado */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-900/95 border-gray-700 text-white backdrop-blur-sm max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#DE1A32]/20">
                  {editingPayment ? (
                    <Edit className="h-5 w-5 text-[#DE1A32]" />
                  ) : (
                    <Plus className="h-5 w-5 text-[#DE1A32]" />
                  )}
                </div>
                {editingPayment ? "Editar Método" : "Nuevo Método de Pago"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingPayment
                  ? "Modifica los datos del método de pago"
                  : "Completa la información para crear un nuevo método"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Nombre del método
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800/50 border-gray-600 focus:border-[#DE1A32] transition-colors"
                  placeholder="ej: Efectivo, Tarjeta de Crédito"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                  Descripción
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800/50 border-gray-600 focus:border-[#DE1A32] transition-colors"
                  placeholder="ej: Pago en efectivo al momento de la entrega"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentage" className="text-sm font-medium text-gray-300">
                    Comisión (%)
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                    className="bg-gray-800/50 border-gray-600 focus:border-[#DE1A32] transition-colors"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="change" className="text-sm font-medium text-gray-300">
                    ¿Aplica recargo?
                  </Label>
                  <div className="flex items-center gap-3 mt-3">
                    <Switch
                      id="change"
                      checked={formData.change}
                      onCheckedChange={(checked) => setFormData({ ...formData, change: checked })}
                      className="data-[state=checked]:bg-orange-500"
                    />
                    <span className="text-sm text-gray-400">{formData.change ? "Sí" : "No"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div>
                  <Label htmlFor="active" className="text-sm font-medium text-gray-300">
                    Estado inicial
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">El método estará disponible para usar</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 hover:bg-gray-800/50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#DE1A32] to-orange-600 hover:from-[#DE1A32]/90 hover:to-orange-600/90 text-white"
                >
                  {editingPayment ? "Actualizar" : "Crear"} Método
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog mejorado */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-gray-900/95 border-red-800/50 text-white max-w-md mx-auto backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                ¿Eliminar método?
              </DialogTitle>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-medium">Esta acción es irreversible</p>
                    <p className="text-red-400/80 text-sm mt-1">
                      El método de pago será eliminado permanentemente del sistema
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-gray-600 hover:bg-gray-800/50 px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6"
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
