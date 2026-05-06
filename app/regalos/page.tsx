"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  History,
  Loader2,
  Package as PackageIcon,
  ImageIcon,
  X as XIcon,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
} from "lucide-react"
import { KauryGift } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { giftsService, type Gift as GiftType, type CreateGiftData } from "@/services/gifts"
import { getProductsService } from "@/services/products"
import type { Product, ProductVariant } from "@/types/types"
import Image from "next/image"

const emptyForm: CreateGiftData = {
  name: "",
  description: "",
  productId: "",
  variantId: "",
  productName: "",
  productImage: "",
  triggerType: "minAmount",
  triggerValue: 0,
  audience: "all",
  validFrom: null,
  validUntil: null,
  active: true,
  requiresPurchaseHistory: false,
  purchaseHistoryWindowDays: 30,
}

const audienceLabels: Record<GiftType["audience"], string> = {
  all: "Todos",
  wholesale: "Mayoristas",
  retail: "Minoristas",
}

export default function RegalosPage() {
  const [gifts, setGifts] = useState<GiftType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<GiftType | null>(null)
  const [formData, setFormData] = useState<CreateGiftData>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = await giftsService.getAll()
      setGifts(data.gifts || [])
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudieron cargar los regalos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const runSearch = useCallback(async () => {
    if (!search.trim()) return
    try {
      setSearching(true)
      const r = await getProductsService({ productName: search.trim(), page: 1 })
      setSearchResults((r.data || []).slice(0, 8))
    } catch (e: any) {
      toast({ title: "Error en búsqueda", description: e?.message || "No se pudo buscar productos", variant: "destructive" })
    } finally {
      setSearching(false)
    }
  }, [search, toast])

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([])
      return
    }
    const t = setTimeout(runSearch, 350)
    return () => clearTimeout(t)
  }, [search, runSearch])

  const pickProduct = (p: Product) => {
    setSelectedProduct(p)
    setSearchResults([])
    setSearch("")
    setFormData((prev) => ({
      ...prev,
      productId: p.id,
      productName: p.name?.es || "",
      productImage: p.images?.[0]?.src || "",
      variantId: p.variants?.[0]?.id || "",
    }))
  }

  const pickVariant = (v: ProductVariant) => {
    setFormData((prev) => ({ ...prev, variantId: v.id }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId || !formData.variantId) {
      toast({ title: "Producto requerido", description: "Seleccioná un producto y variante", variant: "destructive" })
      return
    }
    try {
      setSubmitting(true)
      if (editing) {
        await giftsService.update(editing._id, formData)
        toast({ title: "Regalo actualizado" })
      } else {
        await giftsService.create(formData)
        toast({ title: "Regalo creado" })
      }
      setIsDialogOpen(false)
      setEditing(null)
      setFormData(emptyForm)
      setSelectedProduct(null)
      load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo guardar", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (g: GiftType) => {
    setEditing(g)
    setFormData({
      name: g.name,
      description: g.description ?? "",
      productId: g.productId,
      variantId: g.variantId,
      productName: g.productName ?? "",
      productImage: g.productImage ?? "",
      triggerType: g.triggerType,
      triggerValue: g.triggerValue ?? 0,
      audience: g.audience,
      validFrom: g.validFrom ?? null,
      validUntil: g.validUntil ?? null,
      active: g.active,
      requiresPurchaseHistory: g.requiresPurchaseHistory ?? false,
      purchaseHistoryWindowDays: g.purchaseHistoryWindowDays ?? 30,
    })
    setSelectedProduct(null)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditing(null)
    setFormData(emptyForm)
    setSelectedProduct(null)
    setSearch("")
    setSearchResults([])
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await giftsService.delete(deleteId)
      toast({ title: "Regalo eliminado" })
      load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo eliminar", variant: "destructive" })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Cargando regalos...
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
              <KauryGift className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Regalos automáticos</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configurá productos de regalo según monto o evento
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog} variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo regalo
          </Button>
        </div>

        {/* Empty state */}
        {gifts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-brand-soft flex items-center justify-center shadow-soft">
              <KauryGift className="w-7 h-7 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No hay regalos configurados</h3>
            <p className="mt-1 text-sm text-muted-foreground">Creá tu primer regalo automático</p>
            <Button onClick={openCreateDialog} variant="gradient" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Crear regalo
            </Button>
          </div>
        )}

        {/* Table */}
        {gifts.length > 0 && (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regalo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Audiencia</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gifts.map((g) => (
                  <TableRow key={g._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-foreground truncate">{g.name}</span>
                        {g.requiresPurchaseHistory && (
                          <Badge variant="warning" className="shrink-0 text-[10px]">
                            <History className="h-2.5 w-2.5" />
                            {g.purchaseHistoryWindowDays || 30}d
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-muted ring-1 ring-border/60">
                          {g.productImage ? (
                            <Image
                              src={g.productImage}
                              alt={g.productName || "Producto"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-foreground truncate">{g.productName || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {g.triggerType === "minAmount" ? (
                        <Badge variant="soft">
                          Monto ≥ ${(g.triggerValue ?? 0).toLocaleString("es-AR")}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Siempre</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Users className="h-2.5 w-2.5" />
                        {audienceLabels[g.audience]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {g.validUntil ? new Date(g.validUntil).toLocaleDateString("es-AR") : "Sin vencimiento"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={g.active}
                        onCheckedChange={async (checked) => {
                          await giftsService.update(g._id, { active: checked })
                          load()
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(g)} className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(g._id)}
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
          <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-pop">
                  {editing ? <Edit className="h-4 w-4" /> : <KauryGift className="h-4 w-4" />}
                </span>
                <div>
                  <DialogTitle>{editing ? "Editar regalo" : "Nuevo regalo"}</DialogTitle>
                  <DialogDescription>
                    Asociá un producto que se entrega automáticamente bajo ciertas condiciones
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="giftName">Nombre del regalo</Label>
                <Input
                  id="giftName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Regalo bienvenida"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="giftDesc">Descripción</Label>
                <Input
                  id="giftDesc"
                  value={formData.description ?? ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Texto interno opcional"
                />
              </div>

              {/* Producto seleccionado o buscador */}
              <div className="space-y-2">
                <Label>Producto del regalo</Label>
                {formData.productId ? (
                  <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted ring-1 ring-border/60">
                      {formData.productImage ? (
                        <Image
                          src={formData.productImage}
                          alt={formData.productName || "Producto"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground truncate">{formData.productName}</p>
                      <p className="text-[11px] text-muted-foreground">ID: {formData.productId}</p>
                      {selectedProduct?.variants && selectedProduct.variants.length > 1 && (
                        <Select
                          value={formData.variantId}
                          onValueChange={(v) => pickVariant({ id: v } as ProductVariant)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Variante" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProduct.variants.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {Object.values(v.attr || {}).filter(Boolean).join(" / ") || v.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setFormData((p) => ({ ...p, productId: "", variantId: "", productName: "", productImage: "" }))
                        setSelectedProduct(null)
                      }}
                      className="h-7 w-7"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar producto por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                      {searching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="rounded-xl border border-border/70 bg-card divide-y divide-border/40 max-h-[280px] overflow-auto custom-scrollbar">
                        {searchResults.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => pickProduct(p)}
                            className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                          >
                            <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-muted ring-1 ring-border/60">
                              {p.images?.[0]?.src ? (
                                <Image
                                  src={p.images[0].src.replace("original", "small")}
                                  alt={p.name?.es || ""}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <PackageIcon className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{p.name?.es}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {p.variants?.length || 0} variante{(p.variants?.length || 0) !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="triggerType">Disparador</Label>
                  <Select
                    value={formData.triggerType}
                    onValueChange={(v: any) => setFormData({ ...formData, triggerType: v })}
                  >
                    <SelectTrigger id="triggerType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minAmount">Monto mínimo</SelectItem>
                      <SelectItem value="always">Siempre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.triggerType === "minAmount" && (
                  <div className="space-y-2">
                    <Label htmlFor="triggerValue">Monto (ARS)</Label>
                    <Input
                      id="triggerValue"
                      type="number"
                      min={0}
                      value={formData.triggerValue ?? 0}
                      onChange={(e) =>
                        setFormData({ ...formData, triggerValue: Number(e.target.value) })
                      }
                      placeholder="30000"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="giftAudience">Audiencia</Label>
                  <Select
                    value={formData.audience}
                    onValueChange={(v: any) => setFormData({ ...formData, audience: v })}
                  >
                    <SelectTrigger id="giftAudience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="wholesale">Mayoristas</SelectItem>
                      <SelectItem value="retail">Minoristas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                  <div>
                    <Label htmlFor="giftActive" className="cursor-pointer">Activo</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Disponible al checkout</p>
                  </div>
                  <Switch
                    id="giftActive"
                    checked={formData.active}
                    onCheckedChange={(c) => setFormData({ ...formData, active: c })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="giftValidFrom">Válido desde</Label>
                  <Input
                    id="giftValidFrom"
                    type="date"
                    value={formData.validFrom ?? ""}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giftValidUntil">Válido hasta</Label>
                  <Input
                    id="giftValidUntil"
                    type="date"
                    value={formData.validUntil ?? ""}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || null })}
                  />
                </div>
              </div>

              {/* Restricción por historial de compra */}
              <div className="space-y-3 rounded-xl border border-border/70 bg-warning/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                      <History className="h-4 w-4" />
                    </span>
                    <div>
                      <Label htmlFor="requiresPurchaseHistory" className="text-sm font-semibold cursor-pointer">
                        Solo para clientes con historial de compra
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        El regalo se entrega solo si el cliente está logueado y tiene una compra reciente.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="requiresPurchaseHistory"
                    checked={Boolean(formData.requiresPurchaseHistory)}
                    onCheckedChange={(c) =>
                      setFormData({
                        ...formData,
                        requiresPurchaseHistory: c,
                        purchaseHistoryWindowDays: c
                          ? formData.purchaseHistoryWindowDays || 30
                          : formData.purchaseHistoryWindowDays,
                      })
                    }
                  />
                </div>
                {formData.requiresPurchaseHistory && (
                  <div className="space-y-2 pl-12">
                    <Label htmlFor="purchaseHistoryWindowDays" className="text-xs">
                      Ventana de tiempo (días)
                    </Label>
                    <Input
                      id="purchaseHistoryWindowDays"
                      type="number"
                      min={1}
                      max={365}
                      value={formData.purchaseHistoryWindowDays ?? 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseHistoryWindowDays: Math.max(1, Number(e.target.value || 30)),
                        })
                      }
                      className="max-w-[160px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se consideran órdenes con estado <em>nueva</em>, <em>pago recibido</em>, <em>empaquetada</em> o <em>archivada</em> (excluye canceladas).
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" disabled={submitting} className="gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Actualizar" : "Crear"} regalo
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
              <DialogTitle className="text-center">¿Eliminar regalo?</DialogTitle>
              <DialogDescription className="text-center">
                Esta acción no se puede deshacer. El regalo dejará de entregarse automáticamente.
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
