"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ChevronRight, Plus, X, Wand2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"

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
  const [newPropertyValueMap, setNewPropertyValueMap] = useState<{ [key: string]: string }>({})
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
  }

  const removeProperty = (propertyId: string) => {
    onPropertiesChange(properties.filter((prop) => prop.id !== propertyId))
    if (editingPropertyId === propertyId) {
      setEditingPropertyId(null)
    }
  }

  const addPropertyValue = (propertyId: string) => {
    const trimmedValue = newPropertyValueMap[propertyId]?.trim() || ""
    if (!trimmedValue) return

    const updatedProperties = properties.map((prop) => {
      if (prop.id === propertyId) {
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
    setNewPropertyValueMap(prev => ({ ...prev, [propertyId]: "" }))
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

  const handleValueInputChange = (propertyId: string, value: string) => {
    setNewPropertyValueMap(prev => ({ ...prev, [propertyId]: value }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader className="mb-4 pr-6">
          <SheetTitle className="text-xl">Propiedades</SheetTitle>
          <SheetDescription>Define las propiedades de tus variantes como color, talle, material, etc.</SheetDescription>
        </SheetHeader>

        <div className="px-1 pb-4 border-b mb-4">
          <Label htmlFor="new-property-name" className="text-sm font-medium mb-2 block">Agregar nueva propiedad</Label>
          <div className="flex items-center gap-2">
            <Input
              id="new-property-name"
              placeholder="Nombre (ej: Color)"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              className="flex-1"
              aria-label="Nombre de la nueva propiedad"
            />
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={addProperty}
              disabled={!newPropertyName.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-1 mb-4">
          <div className="space-y-3">
            {properties.length > 0 ? (
              properties.map((property) => (
                <div key={property.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                    <span className="font-medium text-sm capitalize">{property.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeProperty(property.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {editingPropertyId === property.id && (
                    <div className="p-3 space-y-3 bg-background">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Valor para ${property.name} (ej: Rojo)`}
                          value={newPropertyValueMap[property.id] || ""}
                          onChange={(e) => handleValueInputChange(property.id, e.target.value)}
                          className="flex-1 h-9"
                          aria-label={`Nuevo valor para ${property.name}`}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addPropertyValue(property.id)}
                          disabled={!(newPropertyValueMap[property.id] || "").trim()}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Valor
                        </Button>
                      </div>

                      {property.values.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {property.values
                            .filter((value) => value.value.trim() !== "")
                            .map((value) => (
                              <Badge key={value.id} variant="secondary" className="flex items-center gap-1 px-2 py-1 rounded-full text-xs">
                                {value.value}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0 ml-0.5 hover:bg-transparent group"
                                  onClick={() => removePropertyValue(property.id, value.id)}
                                  aria-label={`Eliminar valor ${value.value}`}
                                >
                                  <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                                </Button>
                              </Badge>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">Aún no hay valores para "{property.name}".</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No se han agregado propiedades.</p>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="mt-auto pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onGenerateVariants}
            disabled={properties.length === 0 || properties.every((p) => p.values.length === 0)}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Generar variantes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
