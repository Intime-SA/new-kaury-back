"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ChevronRight, Plus, X, Wand2, Palette, Ruler } from "lucide-react"
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

  /* -------------------------------------------------------------------------- */
  /*                              PRESET SUGGESTION                             */
  /* -------------------------------------------------------------------------- */

  const addPresetProperty = (presetName: string) => {
    const isColorProp = COLOR_PROPERTY_REGEX.test(presetName)

    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      name: presetName,
      isColorProperty: isColorProp,
      values: [],
    }

    onPropertiesChange([...properties, newProperty])

    if (isColorProp) {
      setEditingPropertyId(newProperty.id)
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                CORE LOGIC                                  */
  /* -------------------------------------------------------------------------- */

  const addProperty = () => {
    const trimmedName = newPropertyName.trim()
    if (!trimmedName) return

    const isColorProp = COLOR_PROPERTY_REGEX.test(trimmedName)

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
      if (prop.id === propertyId && prop.isColorProperty && selectedApiColor) {

        if (prop.values.some(v => v.id === selectedApiColor._id)) {
          return prop
        }

        const newValue: PropertyValue = {
          id: selectedApiColor._id,
          value: selectedApiColor.spanish,
          hex: selectedApiColor.hex,
          name: selectedApiColor.name
        }

        return { ...prop, values: [...prop.values, newValue] }
      }
      return prop
    })

    onPropertiesChange(updatedProperties)
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

  const getSelectedColorForProperty = (propertyId: string): Color | null => {
    const prop = properties.find(p => p.id === propertyId && p.isColorProperty)
    if (prop && prop.values.length > 0) {
      const lastColorValue = prop.values[prop.values.length - 1]
      return {
        _id: lastColorValue.id,
        spanish: lastColorValue.value,
        hex: lastColorValue.hex || '#000000',
        name: lastColorValue.name || ''
      }
    }
    return null
  }

  const hasTalle = properties.some(p => p.name.toLowerCase() === "talle")
  const hasColor = properties.some(p => p.name.toLowerCase() === "color")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">

        <SheetHeader className="mb-4 pr-6">
          <SheetTitle className="text-xl">Propiedades</SheetTitle>
          <SheetDescription>
            Define las propiedades de tus variantes como color, talle, material, etc.
          </SheetDescription>
        </SheetHeader>

        {/* ------------------------- NUEVA PROPIEDAD ------------------------- */}

        <div className="px-1 pb-4 border-b mb-4">
          <Label className="text-sm font-medium mb-2 block">
            Agregar nueva propiedad
          </Label>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Nombre (ej: Color, Talle)"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addProperty}
              disabled={!newPropertyName.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          {/* ---------------------- SUGERENCIAS INTELIGENTES ---------------------- */}

          <div className="flex gap-2 mt-3 flex-wrap">
            {!hasTalle && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted transition text-lg"
                onClick={() => addPresetProperty("talle")}
              >
                <Ruler className="mr-2 h-6 w-6" />
                Talle
              </Badge>
            )}

            {!hasColor && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted transition text-lg"
                onClick={() => addPresetProperty("color")}
              >
                <Palette className="mr-2 h-6 w-6" />
                Color
              </Badge>
            )}
          </div>
        </div>

        {/* ----------------------------- PROPERTIES ----------------------------- */}

        <ScrollArea className="flex-1 px-1 mb-4">
          <div className="space-y-3">

            {properties.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No se han agregado propiedades.
              </p>
            )}

            {properties.map((property) => (
              <div key={property.id} className="border rounded-lg overflow-hidden">

                <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                  <div className="flex items-center gap-2">
                    {property.isColorProperty && <Palette className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium text-sm capitalize">
                      {property.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setEditingPropertyId(
                          editingPropertyId === property.id ? null : property.id
                        )
                      }
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          editingPropertyId === property.id ? "rotate-90" : ""
                        }`}
                      />
                    </Button>

                    <Button
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
                  <div className="p-3 space-y-3">

                    {property.isColorProperty ? (
                      isLoadingColors ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10" />
                          ))}
                        </div>
                      ) : apiColors ? (
                        <SelectableColorGrid
                          colors={apiColors}
                          selectedColor={getSelectedColorForProperty(property.id)}
                          onColorSelect={(color) =>
                            handleColorValueSelect(property.id, color)
                          }
                        />
                      ) : null
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Valor para ${property.name}`}
                          value={newPropertyValueMap[property.id] || ""}
                          onChange={(e) =>
                            handleValueInputChange(property.id, e.target.value)
                          }
                          className="flex-1 h-9"
                        />
                        <Button
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
                        {property.values.map((value) => (
                          <Badge key={value.id} variant="secondary">
                            {property.isColorProperty && value.hex && (
                              <span
                                className="w-3 h-3 rounded-full border inline-block mr-2"
                                style={{ backgroundColor: value.hex }}
                              />
                            )}
                            {value.value}
                            <X
                              className="h-3 w-3 ml-2 cursor-pointer"
                              onClick={() =>
                                removePropertyValue(property.id, value.id)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onGenerateVariants}
            disabled={
              properties.length === 0 ||
              properties.every((p) => p.values.length === 0)
            }
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Generar variantes
          </Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  )
}
