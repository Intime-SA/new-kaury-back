"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Calendar,
  Users,
  Hash,
  Percent,
  DollarSign,
  Loader2,
} from "lucide-react"
import { KauryCoupon } from "@/components/icons"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { couponsService, type Coupon, type CreateCouponData } from "@/services/coupons"

const emptyForm: CreateCouponData = {
  code: "",
  description: "",
  type: "percent",
  value: 0,
  minAmount: undefined,
  maxUses: null,
  perUserLimit: null,
  validFrom: null,
  validUntil: null,
  audience: "all",
  stackable: true,
  active: true,
}

const audienceLabels: Record<Coupon["audience"], string> = {
  all: "Todos",
  wholesale: "Mayoristas",
  retail: "Minoristas",
}

export default function CuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<CreateCouponData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "table">("table")
  const { toast } = useToast()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = await couponsService.getAll()
      setCoupons(data.coupons || [])
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudieron cargar los cupones", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const payload: CreateCouponData = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
      }
      if (editing) {
        await couponsService.update(editing._id, payload)
        toast({ title: "Cupón actualizado" })
      } else {
        await couponsService.create(payload)
        toast({ title: "Cupón creado" })
      }
      setIsDialogOpen(false)
      setEditing(null)
      setFormData(emptyForm)
      load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo guardar el cupón", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (c: Coupon) => {
    setEditing(c)
    setFormData({
      code: c.code,
      description: c.description ?? "",
      type: c.type,
      value: c.value,
      minAmount: c.minAmount,
      maxUses: c.maxUses ?? null,
      perUserLimit: c.perUserLimit ?? null,
      validFrom: c.validFrom ?? null,
      validUntil: c.validUntil ?? null,
      audience: c.audience,
      stackable: c.stackable,
      active: c.active,
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditing(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await couponsService.delete(deleteId)
      toast({ title: "Cupón eliminado" })
      load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo eliminar", variant: "destructive" })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const formatValue = (c: Coupon) =>
    c.type === "percent"
      ? `${c.value}%`
      : c.value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Cargando cupones...
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
              <KauryCoupon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Cupones de descuento</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Creá códigos promocionales con porcentaje o monto fijo
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog} variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo cupón
          </Button>
        </div>

        {/* View Mode */}
        <div className="flex gap-1 justify-end p-1 rounded-xl border border-border/60 bg-card w-fit ml-auto">
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

        {/* Empty state */}
        {coupons.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-brand-soft flex items-center justify-center shadow-soft">
              <Tag className="w-7 h-7 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No hay cupones todavía</h3>
            <p className="mt-1 text-sm text-muted-foreground">Creá tu primer código promocional</p>
            <Button onClick={openCreateDialog} variant="gradient" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Crear cupón
            </Button>
          </div>
        )}

        {/* Cards */}
        {coupons.length > 0 && viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {coupons.map((c) => (
              <Card key={c._id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary">
                        {c.type === "percent" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{c.code}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{c.description || "Sin descripción"}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(c)} className="h-8 w-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(c._id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Descuento</p>
                      <p className="mt-1 text-xl font-bold text-foreground">{formatValue(c)}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Usos</p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {c.usesCount}
                        {c.maxUses ? <span className="text-sm text-muted-foreground"> / {c.maxUses}</span> : null}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="soft">
                      <Users className="h-2.5 w-2.5" />
                      {audienceLabels[c.audience]}
                    </Badge>
                    {c.minAmount ? (
                      <Badge variant="outline">
                        Mín. ${c.minAmount.toLocaleString("es-AR")}
                      </Badge>
                    ) : null}
                    {c.stackable && <Badge variant="outline">Acumulable</Badge>}
                    {c.validUntil && (
                      <Badge variant="outline">
                        <Calendar className="h-2.5 w-2.5" />
                        Hasta {new Date(c.validUntil).toLocaleDateString("es-AR")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <Badge variant={c.active ? "success" : "destructive"}>
                      {c.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {c.active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Switch
                      checked={c.active}
                      onCheckedChange={async (checked) => {
                        await couponsService.update(c._id, { active: checked })
                        load()
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table */}
        {coupons.length > 0 && viewMode === "table" && (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Audiencia</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-brand-soft text-primary">
                          <Hash className="h-3 w-3" />
                        </span>
                        {c.code}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="soft" className="font-semibold">{formatValue(c)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.minAmount ? `$${c.minAmount.toLocaleString("es-AR")}` : "—"}
                    </TableCell>
                    <TableCell>
                      {c.usesCount}
                      {c.maxUses ? <span className="text-muted-foreground"> / {c.maxUses}</span> : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{audienceLabels[c.audience]}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.validUntil ? new Date(c.validUntil).toLocaleDateString("es-AR") : "Sin vencimiento"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={c.active}
                        onCheckedChange={async (checked) => {
                          await couponsService.update(c._id, { active: checked })
                          load()
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(c)} className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(c._id)}
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

        {/* Create / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-pop">
                  {editing ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
                <div>
                  <DialogTitle>{editing ? "Editar cupón" : "Nuevo cupón"}</DialogTitle>
                  <DialogDescription>
                    {editing ? "Modificá los datos del cupón" : "Creá un código promocional para tus clientes"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="BIENVENIDA20"
                    className="uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Audiencia</Label>
                  <Select
                    value={formData.audience}
                    onValueChange={(v: any) => setFormData({ ...formData, audience: v })}
                  >
                    <SelectTrigger id="audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="wholesale">Mayoristas</SelectItem>
                      <SelectItem value="retail">Minoristas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description ?? ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descuento de bienvenida"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Porcentaje</SelectItem>
                      <SelectItem value="fixed">Monto fijo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Valor {formData.type === "percent" ? "(%)" : "(ARS)"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min={1}
                    max={formData.type === "percent" ? 100 : undefined}
                    value={formData.value || ""}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder={formData.type === "percent" ? "20" : "5000"}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Compra mínima</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    min={0}
                    value={formData.minAmount ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minAmount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="—"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Usos totales</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min={1}
                    value={formData.maxUses ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUses: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="∞"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perUserLimit">Por usuario</Label>
                  <Input
                    id="perUserLimit"
                    type="number"
                    min={1}
                    value={formData.perUserLimit ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        perUserLimit: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="∞"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Válido desde</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom ?? ""}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido hasta</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil ?? ""}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                  <div>
                    <Label htmlFor="stackable" className="cursor-pointer">Acumulable</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Combinable con otros</p>
                  </div>
                  <Switch
                    id="stackable"
                    checked={formData.stackable}
                    onCheckedChange={(c) => setFormData({ ...formData, stackable: c })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                  <div>
                    <Label htmlFor="active" className="cursor-pointer">Activo</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Disponible al checkout</p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(c) => setFormData({ ...formData, active: c })}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" disabled={submitting} className="gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Actualizar" : "Crear"} cupón
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
              <DialogTitle className="text-center">¿Eliminar cupón?</DialogTitle>
              <DialogDescription className="text-center">
                Esta acción no se puede deshacer. El cupón ya no podrá usarse.
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
