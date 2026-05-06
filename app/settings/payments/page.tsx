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

const getPaymentIcon = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("efectivo") || lowerName.includes("cash")) return Banknote
  if (lowerName.includes("tarjeta") || lowerName.includes("card")) return CreditCard
  if (lowerName.includes("mercado") || lowerName.includes("pago")) return Smartphone
  if (lowerName.includes("transfer") || lowerName.includes("banco")) return Building2
  return Wallet
}

const getPaymentAccent = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("efectivo")) return { bg: "bg-emerald-500/10", text: "text-emerald-600", glow: "rgba(16,185,129,0.18)" }
  if (lowerName.includes("tarjeta")) return { bg: "bg-blue-500/10", text: "text-blue-600", glow: "rgba(59,130,246,0.18)" }
  if (lowerName.includes("mercado")) return { bg: "bg-cyan-500/10", text: "text-cyan-600", glow: "rgba(6,182,212,0.18)" }
  if (lowerName.includes("transfer")) return { bg: "bg-violet-500/10", text: "text-violet-600", glow: "rgba(139,92,246,0.18)" }
  return { bg: "bg-slate-500/10", text: "text-slate-600", glow: "rgba(100,116,139,0.18)" }
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
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          Cargando métodos de pago...
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
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-pop">
                <Wallet className="h-5 w-5" />
              </span>
              {payments.methods.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-bold text-foreground shadow-soft">
                  {payments.methods.length}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Métodos de pago
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gestioná los métodos de pago disponibles en tu sistema
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog} variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo método
          </Button>
        </div>

        {/* View Mode */}
        <div className="flex gap-1 justify-end p-1 rounded-xl border border-border/60 bg-card w-fit ml-auto">
          <Button
            variant={viewMode === "cards" ? "gradient" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="gap-2"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "gradient" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="gap-2"
          >
            <Building2 className="h-3.5 w-3.5" />
            Tabla
          </Button>
        </div>

        {/* Cards */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments.methods.map((payment) => {
              const IconComponent = getPaymentIcon(payment.name)
              const accent = getPaymentAccent(payment.name)

              return (
                <Card
                  key={payment._id}
                  className="group relative overflow-hidden hover:-translate-y-0.5 transition-transform"
                >
                  <div
                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-50 blur-2xl group-hover:opacity-80 transition-opacity"
                    style={{ background: accent.glow }}
                  />
                  <CardHeader className="pb-3 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent.bg} ${accent.text}`}>
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            {payment.name}
                          </h3>
                          <Badge
                            variant={payment.active ? "success" : "destructive"}
                            className="mt-1.5"
                          >
                            {payment.active ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Activo
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" /> Inactivo
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleEdit(payment)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(payment._id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 relative">
                    {payment.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{payment.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Percent className="h-3 w-3 text-info" />
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Comisión</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">{payment.percentage}%</span>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="h-3 w-3 text-warning" />
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Recargo</span>
                        </div>
                        {payment.change ? (
                          <Badge variant="warning" className="mt-0.5">
                            <AlertCircle className="h-3 w-3" />
                            Sí
                          </Badge>
                        ) : (
                          <Badge variant="success" className="mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            No
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <span className="text-xs text-muted-foreground">Estado del método</span>
                      <Switch
                        checked={payment.active}
                        onCheckedChange={async (checked) => {
                          await paymentsService.update(payment._id, { active: checked })
                          loadPayments()
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Recargo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.methods.map((payment: PaymentMethod) => {
                  const IconComponent = getPaymentIcon(payment.name)
                  const accent = getPaymentAccent(payment.name)
                  return (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
                            <IconComponent className="h-4 w-4" />
                          </span>
                          <span className="font-semibold text-foreground">{payment.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{payment.description}</TableCell>
                      <TableCell>
                        <Badge variant="info">{payment.percentage}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.change ? "warning" : "success"}>
                          {payment.change ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={payment.active}
                          onCheckedChange={async (checked) => {
                            await paymentsService.update(payment._id, { active: checked })
                            loadPayments()
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(payment)} className="h-8 w-8">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteClick(payment._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
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

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-pop">
                  {editingPayment ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
                <div>
                  <DialogTitle>{editingPayment ? "Editar método" : "Nuevo método de pago"}</DialogTitle>
                  <DialogDescription>
                    {editingPayment
                      ? "Modificá los datos del método"
                      : "Completá la información para crear un nuevo método"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del método</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Efectivo, Tarjeta de crédito"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ej: Pago en efectivo al momento de la entrega"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentage">Comisión (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="change">¿Aplica recargo?</Label>
                  <div className="flex items-center gap-3 mt-3">
                    <Switch
                      id="change"
                      checked={formData.change}
                      onCheckedChange={(checked) => setFormData({ ...formData, change: checked })}
                    />
                    <span className="text-sm text-muted-foreground">{formData.change ? "Sí" : "No"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                <div>
                  <Label htmlFor="active">Estado inicial</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">El método estará disponible para usar</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient">
                  {editingPayment ? "Actualizar" : "Crear"} método
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
              <DialogTitle className="text-center">¿Eliminar método?</DialogTitle>
              <DialogDescription className="text-center">
                Esta acción es irreversible. El método de pago se eliminará permanentemente del sistema.
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
