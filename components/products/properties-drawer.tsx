"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ChevronRight, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PropertyValue {
  id: string
  value: string
}

interface Property {
  id: string
  name: string
  values: PropertyValue[]
}

interface PropertiesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  properties: Property[]
  onPropertiesChange: (properties: Property[]) => void
  onGenerateVariants: () => void
}

export function PropertiesDrawer({
  open,
  onOpenChange,
  properties,
  onPropertiesChange,
  onGenerateVariants,
}: PropertiesDrawerProps) {
  const [newPropertyName, setNewPropertyName] = useState("")
  const [newPropertyValue, setNewPropertyValue] = useState("")
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)

  const addProperty = () => {
    if (!newPropertyName.trim()) return

    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      name: newPropertyName.trim(),
      values: [],
    }

    onPropertiesChange([...properties, newProperty])
    setNewPropertyName("")
    setEditingPropertyId(newProperty.id)
  }

  const removeProperty = (propertyId: string) => {
    onPropertiesChange(properties.filter((prop) => prop.id !== propertyId))
    if (editingPropertyId === propertyId) {
      setEditingPropertyId(null)
    }
  }

  const addPropertyValue = (propertyId: string) => {
    const trimmedValue = newPropertyValue.trim()
    if (!trimmedValue) return

    const updatedProperties = properties.map((prop) => {
      if (prop.id === propertyId) {
        // Verificar que el valor no exista ya en esta propiedad
        if (prop.values.some((v) => v.value === trimmedValue)) {
          return prop
        }

        return {
          ...prop,
          values: [
            ...prop.values,
            {
              id: `val_${Date.now()}`,
              value: trimmedValue,
            },
          ],
        }
      }
      return prop
    })

    onPropertiesChange(updatedProperties)
    setNewPropertyValue("")
  }

  const removePropertyValue = (propertyId: string, valueId: string) => {
    const updatedProperties = properties.map((prop) => {
      if (prop.id === propertyId) {
        return {
          ...prop,
          values: prop.values.filter((val) => val.id !== valueId),
        }
      }
      return prop
    })

    onPropertiesChange(updatedProperties)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Propiedades</SheetTitle>
          <SheetDescription>Define las propiedades de tus variantes como color, talle, material, etc.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="gap-1 text-blue-600" 
              onClick={() => onOpenChange(false)}
            >
              <Plus className="h-4 w-4" /> Agregar propiedad
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Nombre de la propiedad (ej: Color, Talle)"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button"
              size="sm" 
              onClick={addProperty} 
              disabled={!newPropertyName.trim()}
            >
              Agregar
            </Button>
          </div>

          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="border rounded-md">
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{property.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingPropertyId(editingPropertyId === property.id ? null : property.id)
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          editingPropertyId === property.id ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeProperty(property.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {editingPropertyId === property.id && (
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={`Valor para ${property.name} (ej: Rojo, XL)`}
                        value={newPropertyValue}
                        onChange={(e) => setNewPropertyValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addPropertyValue(property.id)}
                        disabled={!newPropertyValue.trim()}
                      >
                        Agregar
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {property.values
                        .filter((value) => value.value.trim() !== "")
                        .map((value) => (
                          <Badge key={value.id} variant="secondary" className="gap-1 px-2 py-1">
                            {value.value}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                              onClick={() => removePropertyValue(property.id, value.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      {property.values.length === 0 && (
                        <span className="text-sm text-muted-foreground">No hay valores definidos</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={onGenerateVariants}
              disabled={properties.length === 0 || properties.every((p) => p.values.length === 0)}
            >
              Generar variantes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
