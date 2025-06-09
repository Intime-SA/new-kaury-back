"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#DE1A32]/10">
              <Plus className="h-6 w-6 text-[#DE1A32]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configuraciones Generales</h1>
              <p className="text-gray-400">Gestiona los settings generales del sistema</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="bg-[#DE1A32] hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Setting
          </Button>
        </div>

        {/* Toggle Cards/Table */}
        <div className="flex gap-2 justify-end mb-4">
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
            className={viewMode === "table" ? "bg-[#DE1A32] hover:bg-orange-600 text-white" : ""}
          >
            Tabla
          </Button>
        </div>

        {/* Content */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.settings.map((setting) => (
              <Card key={setting._id} className="bg-transparent border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{setting.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(setting)}
                        className="h-8 w-8 p-0 hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(setting._id)}
                        className="h-8 w-8 p-0 hover:bg-red-900/20 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
{/*                   <CardTitle className="text-base text-gray-400">{setting.description}</CardTitle> */}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-white text-right">
                      {setting.value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
               {/*      <span className="text-gray-400">Cambio:</span> */}
                    <span className="text-gray-400">Activo:</span>
                    <span className="flex justify-end">
                      <Switch
                        checked={setting.active}
                        onCheckedChange={async (checked) => {
                          await settingsCommonService.update(setting._id, { active: checked })
                          loadSettings()
                        }}
                      />
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
                  <TableHead className="text-gray-400">Nombre</TableHead>
                  <TableHead className="text-gray-400">Descripción</TableHead>
                  <TableHead className="text-gray-400">Valor</TableHead>
                  <TableHead className="text-gray-400">Cambio</TableHead>
                  <TableHead className="text-gray-400">Activo</TableHead>
                  <TableHead className="text-gray-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.settings.map((setting) => (
                  <TableRow key={setting._id} className="border-gray-800">
                    <TableCell className="text-white font-medium">{setting.name}</TableCell>
                    <TableCell className="text-gray-300">{setting.description}</TableCell>
                    <TableCell className="text-gray-300">{setting.value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-gray-300">{setting.change ? "Sí" : "No"}</TableCell>
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
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(setting)} className="h-8 w-8 p-0 hover:bg-gray-800">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(setting._id)} className="h-8 w-8 p-0 hover:bg-red-900/20 hover:text-red-400">
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
              <DialogTitle>{editingSetting ? "Editar Setting" : "Nuevo Setting"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingSetting ? "Modifica los datos del setting" : "Completa los datos para crear un nuevo setting"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                  placeholder="ej: Mínimo de Compra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700"
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
                    className="bg-gray-800 border-gray-700"
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-700">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#DE1A32] text-white hover:bg-orange-600">
                  {editingSetting ? "Actualizar" : "Crear"} Setting
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-[#09090B] border border-gray-800 text-white max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">¿Eliminar setting?</DialogTitle>
              <div className="flex items-center gap-3 mt-2 mb-4">
                <Trash2 className="h-7 w-7 text-red-500" />
                <span className="text-gray-400 text-lg">Esta acción no se puede deshacer.</span>
              </div>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-gray-700 px-6 py-2 text-lg">
                Cancelar
              </Button>
              <Button onClick={confirmDelete} className="bg-[#DE1A32] text-white hover:bg-orange-600 px-6 py-2 text-lg">
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
