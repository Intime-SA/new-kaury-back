"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { settingsCommonService, type CommonSetting, type CommonSettingResponse } from "@/services/settings-common"

export default function CommonSettingsPage() {
  const [settings, setSettings] = useState<CommonSettingResponse>({ settings: [] })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<CommonSetting | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    value: 0,
    change: false,
    active: true,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsCommonService.getAll()
      setSettings(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSetting && editingSetting._id) {
        await settingsCommonService.update(editingSetting._id, formData)
        toast({ title: "Éxito", description: "Setting actualizado correctamente" })
      } else {
        await settingsCommonService.create(formData)
        toast({ title: "Éxito", description: "Setting creado correctamente" })
      }
      setIsDialogOpen(false)
      setEditingSetting(null)
      resetForm()
      loadSettings()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el setting", variant: "destructive" })
    }
  }

  const handleEdit = (setting: CommonSetting) => {
    setEditingSetting(setting)
    setFormData({
      name: setting.name,
      description: setting.description,
      value: setting.value,
      change: setting.change,
      active: setting.active,
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
      await settingsCommonService.delete(deleteId)
      toast({ title: "Éxito", description: "Setting eliminado correctamente" })
      loadSettings()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el setting", variant: "destructive" })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      value: 0,
      change: false,
      active: true,
    })
  }

  const openCreateDialog = () => {
    setEditingSetting(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const exemptionSetting = settings.settings.find((s) => s.name === "Excepcion Minimo Recompra")

  const enableExemption = async () => {
    try {
      await settingsCommonService.create({
        name: "Excepcion Minimo Recompra",
        description: "Días sin mínimo de compra desde la última orden del cliente",
        value: 15,
        change: false,
        active: true,
      })
      toast({
        title: "Excepción habilitada",
        description: "Clientes con compra en los últimos 15 días no tienen mínimo.",
      })
      loadSettings()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el setting", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          Cargando configuraciones...
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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-pop">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Configuraciones generales</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Gestioná los settings generales del sistema</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo setting
          </Button>
        </div>

        {/* Excepción de mínimo por recompra */}
        {!exemptionSetting && (
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-[260px]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Excepción al mínimo de compra por recompra
                  <Sparkles className="h-3.5 w-3.5 text-warning" />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clientes con una compra en los últimos 15 días no necesitan alcanzar el mínimo. Aún no está habilitada.
                </p>
              </div>
            </div>
            <Button onClick={enableExemption} variant="warning" className="gap-2">
              <Calendar className="h-4 w-4" />
              Habilitar (15 días)
            </Button>
          </div>
        )}

        {/* Toggle Cards/Table */}
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

        {/* Content */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.settings.map((setting) => (
              <Card key={setting._id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold text-foreground">{setting.name}</span>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleEdit(setting)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Valor</span>
                    <span className="font-bold text-foreground">
                      {setting.value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Activo</span>
                    <Switch
                      checked={setting.active}
                      onCheckedChange={async (checked) => {
                        await settingsCommonService.update(setting._id, { active: checked })
                        loadSettings()
                      }}
                    />
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Cambio</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.settings.map((setting) => (
                  <TableRow key={setting._id}>
                    <TableCell className="font-semibold text-foreground">{setting.name}</TableCell>
                    <TableCell className="text-muted-foreground">{setting.description}</TableCell>
                    <TableCell className="font-medium text-foreground">{setting.value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant={setting.change ? "soft" : "outline"}>{setting.change ? "Sí" : "No"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={setting.active}
                        onCheckedChange={async (checked) => {
                          await settingsCommonService.update(setting._id, { active: checked })
                          loadSettings()
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(setting)} className="h-8 w-8">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteClick(setting._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
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
              <DialogTitle>{editingSetting ? "Editar setting" : "Nuevo setting"}</DialogTitle>
              <DialogDescription>
                {editingSetting ? "Modificá los datos del setting" : "Completá los datos para crear un nuevo setting"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  disabled
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Mínimo de compra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ej: Mínimo de compra para poder realizar una compra"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder="ej: 80000"
                    required
                  />
                </div>
{/*                 <div className="space-y-2 flex items-center gap-2 mt-6">
                  <Label htmlFor="change">Cambio</Label>
                  <Switch
                    id="change"
                    checked={formData.change}
                    onCheckedChange={(checked) => setFormData({ ...formData, change: checked })}
                  />
                </div> */}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="active">Activo</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient">
                  {editingSetting ? "Actualizar" : "Crear"} setting
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
              <DialogTitle className="text-center">¿Eliminar setting?</DialogTitle>
              <DialogDescription className="text-center">
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 sm:gap-3">
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
