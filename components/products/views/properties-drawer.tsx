"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ChevronRight, Plus, X, Wand2, Palette } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import SelectableColorGrid, { Color } from '@/components/products/views/selected-color'
import { useColors } from '@/hooks/utility/useColors'
import { Skeleton } from "@/components/ui/skeleton"

interface PropertyValue {
  id: string
  value: string
  hex?: string
  name?: string
}

interface Property {
  id: string
  name: string
  isColorProperty: boolean
  values: PropertyValue[]
}

interface PropertiesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  properties: Property[]
  onPropertiesChange: (properties: Property[]) => void
  onGenerateVariants: () => void
}

const COLOR_PROPERTY_REGEX = /color/i;

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

  const { colors: apiColors, isLoading: isLoadingColors, error: colorsError } = useColors()

  console.log("properties", properties)
  const addProperty = () => {
    const trimmedName = newPropertyName.trim()
    if (!trimmedName) return

    const isColorProp = COLOR_PROPERTY_REGEX.test(trimmedName)

    console.log("isColorProp", isColorProp)

    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      name: trimmedName,
      isColorProperty: isColorProp,
      values: [],
    }

    onPropertiesChange([...properties, newProperty])
    setNewPropertyName("")
    if (isColorProp) {
      setEditingPropertyId(newProperty.id)
    }
  }

  const removeProperty = (propertyId: string) => {
    onPropertiesChange(properties.filter((prop) => prop.id !== propertyId))
    if (editingPropertyId === propertyId) {
      setEditingPropertyId(null)
    }
  }

  const addManualPropertyValue = (propertyId: string) => {
    const trimmedValue = newPropertyValueMap[propertyId]?.trim() || ""
    if (!trimmedValue) return

    const updatedProperties = properties.map((prop) => {
      if (prop.id === propertyId && !prop.isColorProperty) {
        if (prop.values.some((v) => v.value.toLowerCase() === trimmedValue.toLowerCase())) {
          return prop
        }
        return {
          ...prop,
          values: [
            ...prop.values,
            { id: `val_${Date.now()}`, value: trimmedValue },
          ],
        }
      }
      return prop
    })
    onPropertiesChange(updatedProperties)
    setNewPropertyValueMap(prev => ({ ...prev, [propertyId]: "" }))
  }

  const handleColorValueSelect = (propertyId: string, selectedApiColor: Color | null) => {
    const updatedProperties = properties.map((prop) => {
      if (prop.id === propertyId && prop.isColorProperty) {
        if (!selectedApiColor) {
          return prop;
        }

        if (prop.values.some(v => v.id === selectedApiColor._id)) {
            return prop;
        }

        const newValue: PropertyValue = {
          id: selectedApiColor._id,
          value: selectedApiColor.spanish,
          hex: selectedApiColor.hex,
          name: selectedApiColor.name
        };
        return { ...prop, values: [...prop.values, newValue] };
      }
      return prop;
    });
    onPropertiesChange(updatedProperties);
  }

  const removePropertyValue = (propertyId: string, valueId: string) => {
    removeColorValue(propertyId, valueId, false)
  }

  const removeColorValue = (propertyId: string, valueIdentifier: string, isDeselecting: boolean) => {
    const updatedProperties = properties.map((prop) => {
      if (prop.id === propertyId) {
        return {
          ...prop,
          values: prop.values.filter((val) => val.id !== valueIdentifier),
        }
      }
      return prop
    })
    onPropertiesChange(updatedProperties)
  }

  const handleValueInputChange = (propertyId: string, value: string) => {
    setNewPropertyValueMap(prev => ({ ...prev, [propertyId]: value }))
  }

  const getSelectedColorForProperty = (propertyId: string): Color | null => {
    const prop = properties.find(p => p.id === propertyId && p.isColorProperty);
    if (prop && prop.values.length > 0) {
      const lastColorValue = prop.values[prop.values.length - 1];
      return {
        _id: lastColorValue.id,
        spanish: lastColorValue.value,
        hex: lastColorValue.hex || '#000000',
        name: lastColorValue.name || ''
      };
    }
    return null;
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
              placeholder="Nombre (ej: Color, Talle)"
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
                    <div className="flex items-center gap-2">
                      {property.isColorProperty && <Palette className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium text-sm capitalize">{property.name}</span>
                    </div>
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
                      {property.isColorProperty ? (
                        isLoadingColors ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 border rounded-md">
                                <Skeleton className="w-8 h-8 rounded-md" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                            ))}
                          </div>
                        ) : colorsError ? (
                          <p className="text-destructive text-sm">Error al cargar colores: {colorsError.message}</p>
                        ) : apiColors && apiColors.length > 0 ? (
                          <SelectableColorGrid
                            colors={apiColors}
                            selectedColor={getSelectedColorForProperty(property.id)}
                            onColorSelect={(color) => handleColorValueSelect(property.id, color)}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">No hay colores disponibles en la API.</p>
                        )
                      ) : (
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
                            onClick={() => addManualPropertyValue(property.id)}
                            disabled={!(newPropertyValueMap[property.id] || "").trim()}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Valor
                          </Button>
                        </div>
                      )}

                      {property.values.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {property.values
                            .filter((value) => value.value.trim() !== "")
                            .map((value) => (
                              <Badge
                                key={value.id}
                                variant="secondary"
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm"
                              >
                                {property.isColorProperty && value.hex && (
                                  <span className="w-3 h-3 rounded-full border inline-block" style={{ backgroundColor: value.hex }}></span>
                                )}
                                {value.value}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0 ml-0.5 hover:bg-transparent group"
                                  onClick={() => removePropertyValue(property.id, value.id)}
                                >
                                  <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                                </Button>
                              </Badge>
                            ))}
                        </div>
                      )}
                      {!property.isColorProperty && property.values.length === 0 && (
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
