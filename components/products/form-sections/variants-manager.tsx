"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit, AlertCircle, Info, Pencil, Check, Instagram, ChevronDown, X } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { PropertiesDrawer } from "@/components/products/views/properties-drawer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductImage, ProductVariant } from "@/types/types"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

interface PropertyValue {
  id: string
  value: string
}

interface Property {
  id: string
  name: string
  values: PropertyValue[]
  isColorProperty: boolean
}

interface VariantsManagerProps {
  variants: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
  stockManagement: boolean
  initialUseGlobalPrices?: boolean
  onUseGlobalPricesChange: (value: boolean) => void
  initialGlobalUnitPrice?: string | null
  onGlobalUnitPriceChange: (value: string) => void
  initialGlobalPromotionalPrice?: string | null
  onGlobalPromotionalPriceChange: (value: string) => void
  initialGlobalCost?: string | null
  onGlobalCostChange: (value: string) => void
}

const isVariantConfirmed = (variant: ProductVariant) => {
  return !variant.id.toString().startsWith('temp_');
};

// Definir la expresión regular para identificar propiedades de color
const COLOR_PROPERTY_REGEX = /color/i;

export function VariantsManager({ variants, onChange, stockManagement, initialUseGlobalPrices, onUseGlobalPricesChange, initialGlobalUnitPrice, onGlobalUnitPriceChange, initialGlobalPromotionalPrice, onGlobalPromotionalPriceChange, initialGlobalCost, onGlobalCostChange }: VariantsManagerProps) {
  const images = useSelector((state: RootState) => state.products.images);
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPropertiesDrawerOpen, setIsPropertiesDrawerOpen] = useState(false)
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [properties, setProperties] = useState<Property[]>([])

  // Estados para precios globales
  const [useGlobalPrices, setUseGlobalPrices] = useState(initialUseGlobalPrices ?? false);
  const [globalUnitPrice, setGlobalUnitPrice] = useState(initialGlobalUnitPrice ?? "");
  const [globalPromotionalPrice, setGlobalPromotionalPrice] = useState(initialGlobalPromotionalPrice ?? "");
  const [globalCost, setGlobalCost] = useState(initialGlobalCost ?? "");

  const defaultVariant: ProductVariant = {
    id: `temp_${Date.now()}`,
    value: "",
    attr: {},
    stock: null,
    stockManagement: stockManagement,
    unit_price: 0,
    promotionalPrice: null,
    imageId: images.length > 0 ? images[0].id.toString() : null,
    shooterCount: 0,
    targetCount: 0,
    productId: "",
    sku: "",
    ageGroup: "",
    gender: "",
    cost: 0,
  }

  // Inicializar propiedades desde variantes existentes
  useEffect(() => {
    if (variants.length > 0) {
      const existingProperties: Property[] = [];

      // Extraer propiedades únicas de las variantes
      variants.forEach((variant) => {
        Object.entries(variant.attr).forEach(([key, value]) => {
          let property = existingProperties.find((p) => p.name === key);

          if (!property) {
            property = {
              id: `prop_${Date.now()}_${key}`,
              name: key,
              values: [],
              isColorProperty: COLOR_PROPERTY_REGEX.test(key),
            };
            existingProperties.push(property);
          }

          // Agregar valor si no existe
          if (!property.values.some((v) => v.value === value)) {
            property.values.push({
              id: `val_${Date.now()}_${value}`,
              value: value,
            });
          }
        });
      });

      if (existingProperties.length > 0 && properties.length === 0) {
        setProperties(existingProperties);
      }
    }
  }, [variants]);

  const handleAddVariant = () => {
    const numericGlobalUnitPrice = parseFloat(globalUnitPrice);
    const numericGlobalPromoPrice = parseFloat(globalPromotionalPrice);
    const numericGlobalCost = parseFloat(globalCost);

    setCurrentVariant({
       ...defaultVariant,
       unit_price: useGlobalPrices && !isNaN(numericGlobalUnitPrice) ? numericGlobalUnitPrice : 0,
       promotionalPrice: useGlobalPrices && !isNaN(numericGlobalPromoPrice) ? numericGlobalPromoPrice : null,
       cost: useGlobalPrices && !isNaN(numericGlobalCost) ? numericGlobalCost : 0,
       // Asegurar que el stockManagement se hereda correctamente
       stockManagement: stockManagement,
    });
    setEditIndex(null);
    setIsDialogOpen(true);
  };

  const handleEditVariant = (variant: ProductVariant, index: number) => {
     const numericGlobalUnitPrice = parseFloat(globalUnitPrice);
     const numericGlobalPromoPrice = parseFloat(globalPromotionalPrice);
     const numericGlobalCost = parseFloat(globalCost);

     // Al editar, si los precios globales están activos, los campos del modal mostrarán los globales (y estarán deshabilitados)
     // Si no, mostrarán los de la variante específica.
     setCurrentVariant({
       ...variant,
       unit_price: useGlobalPrices && !isNaN(numericGlobalUnitPrice) ? numericGlobalUnitPrice : variant.unit_price,
       promotionalPrice: useGlobalPrices && !isNaN(numericGlobalPromoPrice) ? numericGlobalPromoPrice : variant.promotionalPrice,
       cost: useGlobalPrices && !isNaN(numericGlobalCost) ? numericGlobalCost : variant.cost,
     });
     setEditIndex(index);
     setIsDialogOpen(true);
  };

  const handleDeleteVariant = (index: number) => {
    const updatedVariants = [...variants]
    updatedVariants.splice(index, 1)
    onChange(updatedVariants)
  }

  const handleSaveVariant = () => {
    if (!currentVariant) return;

    // Validar campos requeridos antes de guardar
    if (!currentVariant.id || currentVariant.id.trim() === '') {
      toast({
        title: "Error",
        description: "El IDC es requerido",
        variant: "destructive"
      });
      return; 
    }

    const updatedVariants = [...variants];
    const variantToSave = { ...currentVariant };

    // Si la variante no está confirmada (tiene ID temporal) y todos los campos requeridos están completos
    if (!isVariantConfirmed(variantToSave) && 
        variantToSave.id && 
        variantToSave.unit_price > 0 && 
        Object.keys(variantToSave.attr).length > 0) {
      // Asignar un ID permanente
      variantToSave.id = Date.now().toString();
    }

    if (editIndex !== null) {
      updatedVariants[editIndex] = variantToSave;
    } else {
      updatedVariants.push(variantToSave);
    }

    onChange(updatedVariants);
    setIsDialogOpen(false);
  }

  const updateVariantField = (field: string, value: any) => {
    if (!currentVariant) return;

    if (field.startsWith("attr.")) {
      const attrKey = field.split(".")[1];
      setCurrentVariant({
        ...currentVariant,
        attr: {
          ...currentVariant.attr,
          [attrKey]: value,
        },
      });
    } else {
      setCurrentVariant({
        ...currentVariant,
        [field]: value,
      });
    }
  }

  const generateVariants = () => {
    // Filtrar propiedades que tienen valores
    const validProperties = properties.filter(
      (prop) => prop.values.length > 0 && prop.values.every((val) => val.value.trim() !== ""),
    )

    if (validProperties.length === 0) return

    // Función recursiva para generar todas las combinaciones posibles
    const generateCombinations = (
      properties: Property[],
      currentIndex: number,
      currentCombination: { [key: string]: string },
      result: { [key: string]: string }[],
    ) => {
      if (currentIndex === properties.length) {
        result.push({ ...currentCombination })
        return
      }

      const currentProperty = properties[currentIndex]
      for (const value of currentProperty.values) {
        currentCombination[currentProperty.name] = value.value
        generateCombinations(properties, currentIndex + 1, currentCombination, result)
      }
    }

    const combinations: { [key: string]: string }[] = []
    generateCombinations(validProperties, 0, {}, combinations)

    // Mostrar previsualización de combinaciones
    console.log("Combinaciones que se generarán:", combinations.map(combo => 
      Object.entries(combo).map(([key, value]) => `${key}: ${value}`).join(", ")
    ))

    // Crear variantes basadas en las combinaciones
    const numericGlobalUnitPrice = parseFloat(globalUnitPrice);
    const numericGlobalPromoPrice = parseFloat(globalPromotionalPrice);
    const numericGlobalCost = parseFloat(globalCost);

    const newVariants: ProductVariant[] = combinations.map((combination) => {
      // Verificar si ya existe una variante con esta combinación
      const existingVariant = variants.find((variant) => {
        return Object.entries(combination).every(([key, value]) => variant.attr[key] === value)
      })

      if (existingVariant) {
        return existingVariant
      }

      // Crear una nueva variante
      return {
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        value: Object.values(combination).join(" "),
        attr: { ...combination },
        stock: null,
        stockManagement: stockManagement,
        unit_price: useGlobalPrices && !isNaN(numericGlobalUnitPrice) ? numericGlobalUnitPrice : 0,
        promotionalPrice: useGlobalPrices && !isNaN(numericGlobalPromoPrice) ? numericGlobalPromoPrice : null,
        imageId: images.length > 0 ? images[0].id.toString() : null,
        shooterCount: 0,
        targetCount: 0,
        productId: "",
        sku: "",
        ageGroup: "",
        gender: "",
        cost: useGlobalPrices && !isNaN(numericGlobalCost) ? numericGlobalCost : 0,
      }
    })

    onChange(newVariants)
    setIsPropertiesDrawerOpen(false)
  }

  const getVariantLabel = (variant: ProductVariant) => {
    return (
      Object.entries(variant.attr)
        .filter(([_, value]) => value.trim() !== "")
        .map(([key, value]) => `${value}`)
        .join(" ") || "Sin especificar"
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Variantes del producto</h3>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setIsPropertiesDrawerOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Propiedades
          </Button>
          <Button 
            type="button"
            onClick={handleAddVariant}
            disabled={properties.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar variante
          </Button>
        </div>
      </div>

      {/* SECCIÓN PRECIOS GLOBALES */}
      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-3">
             <Switch
               id="use-global-prices"
               checked={useGlobalPrices}
               onCheckedChange={(checked) => {
                 setUseGlobalPrices(checked);
                 onUseGlobalPricesChange(checked);
               }}
               aria-label="Usar precios globales"
             />
             <Label htmlFor="use-global-prices" className="cursor-pointer">Usar precios globales para todas las variantes</Label>
             <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] text-xs">
                    <p>Si activas esta opción, los precios definidos aquí se aplicarán a todas las variantes nuevas y pre-completarán los campos al editar. Los campos de precio individuales se desactivarán.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0">
           <div>
             <Label htmlFor="global-unit-price" className="text-sm mb-1 block">Precio de venta global</Label>
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="global-unit-price"
                  type="number" min="0" step="0.01"
                  className="pl-7 bg-background border-muted disabled:cursor-not-allowed disabled:opacity-70"
                  value={globalUnitPrice}
                  onChange={(e) => {
                    setGlobalUnitPrice(e.target.value);
                    onGlobalUnitPriceChange(e.target.value);
                  }}
                  disabled={!useGlobalPrices}
                  placeholder="Ej: 100.00"
                />
             </div>
           </div>
           <div>
             <Label htmlFor="global-promo-price" className="text-sm mb-1 block">Precio promocional global</Label>
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="global-promo-price"
                  type="number" min="0" step="0.01"
                  className="pl-7 bg-background border-muted disabled:cursor-not-allowed disabled:opacity-70"
                  value={globalPromotionalPrice}
                  onChange={(e) => {
                    setGlobalPromotionalPrice(e.target.value);
                    onGlobalPromotionalPriceChange(e.target.value);
                  }}
                  disabled={!useGlobalPrices}
                  placeholder="Opcional"
                />
             </div>
           </div>
           <div>
             <Label htmlFor="global-cost" className="text-sm mb-1 block">Costo global</Label>
              <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="global-cost"
                    type="number" min="0" step="0.01"
                    className="pl-7 bg-background border-muted disabled:cursor-not-allowed disabled:opacity-70"
                    value={globalCost}
                    onChange={(e) => {
                      setGlobalCost(e.target.value);
                      onGlobalCostChange(e.target.value);
                    }}
                    disabled={!useGlobalPrices}
                    placeholder="Uso interno"
                  />
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Propiedades seleccionadas */}
      {properties.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="py-2">
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="flex items-center gap-3">
                  <span className="font-medium min-w-[100px] text-sm capitalize">{property.name}:</span>
                  <div className="flex flex-wrap gap-2">
                    {property.values.map((value) => {
                      // Verificar si el valor está en uso en alguna variante
                      const isValueInUse = variants.some(
                        variant => variant.attr[property.name] === value.value
                      );

                      if (value.value.trim() === "") return null;

                      return (
                        <Badge 
                          key={value.id} 
                          variant="outline"
                          className={cn(
                            "bg-background/50 flex items-center gap-1",
                            isValueInUse ? "cursor-not-allowed" : "cursor-pointer hover:bg-destructive/10"
                          )}
                        >
                          {value.value}
                          {!isValueInUse && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                              onClick={() => {
                                const updatedProperties = properties.map(p => {
                                  if (p.id === property.id) {
                                    return {
                                      ...p,
                                      values: p.values.filter(v => v.id !== value.id)
                                    };
                                  }
                                  return p;
                                });
                                setProperties(updatedProperties);
                              }}
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {variants.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">
            No hay variantes configuradas. Agrega propiedades y genera variantes para definir precios y stock.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>IDC</TableHead>
                <TableHead>Atributos</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id} className={cn(
                  "relative",
                  !isVariantConfirmed(variant) && "bg-muted/50"
                )}>
                  <TableCell>
                    {variant.imageId ? (
                      <div className="relative h-20 w-20">
                        <Image
                          src={images.find((img) => img.id.toString() === variant.imageId)?.src || "/placeholder.svg"}
                          alt={variant.id}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center bg-secondary">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{variant.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(variant.attr).map(([key, value], index) => (
                        <Badge 
                          key={`${variant.id}-${key}`} 
                          variant="outline"
                          className="bg-background/50"
                        >
                          {`${key}: ${value}`}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>${variant.unit_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={isVariantConfirmed(variant) ? "default" : "secondary"}>
                      {isVariantConfirmed(variant) ? (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Confirmada</span>
                        </div>
                      ) : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditVariant(variant, variants.indexOf(variant))}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[100px] text-xs">
                            <p>Editar variante</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteVariant(variants.indexOf(variant))}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[100px] text-xs">
                            <p>Eliminar variante</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog para editar variante */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setCurrentVariant(null);
            setEditIndex(null);
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent 
          className="sm:max-w-[600px]" 
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Editar variante</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configura los detalles de esta variante de producto
            </DialogDescription>
          </DialogHeader>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveVariant();
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Label htmlFor="id" className="text-base font-medium">IDC</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] text-xs">
                          <p>Este es el IDC (Identificador Único del sistema Contable). Es el ID seleccionado a esta variante en particular.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="id"
                    value={currentVariant?.id || ""}
                    onChange={(e) => updateVariantField("id", e.target.value)}
                    placeholder="Identificador único"
                    required
                    className="bg-background border-muted"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Label htmlFor="image" className="text-base font-medium">Imagen</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-xs">
                          <p>Esta funcionalidad es para asociar una imagen a una variante.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <div 
                        className={cn(
                          "relative h-[140px] w-full cursor-pointer rounded-lg border",
                          "hover:border-primary/50 transition-colors",
                          !currentVariant || !isVariantConfirmed(currentVariant) ? "opacity-50" : "",
                          currentVariant?.imageId ? "" : "border-dashed bg-muted/10"
                        )}
                        role="button"
                        tabIndex={0}
                        aria-disabled={!currentVariant || !isVariantConfirmed(currentVariant)}
                      >
                        {currentVariant?.imageId ? (
                          <Image
                            src={images.find(img => img.id.toString() === currentVariant.imageId)?.src || "/placeholder.svg"}
                            alt="Imagen seleccionada"
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Seleccionar imagen</span>
                          </div>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" align="start">
                      <div className="grid grid-cols-3 gap-3">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className={cn(
                              "relative h-20 w-20 cursor-pointer rounded-lg border-2 overflow-hidden",
                              currentVariant?.imageId === image.id.toString() ? "border-primary" : "border-transparent hover:border-primary/50",
                            )}
                            onClick={() => updateVariantField("imageId", image.id.toString())}
                            role="button"
                            tabIndex={0}
                          >
                            <Image
                              src={image.src}
                              alt={`Imagen ${image.position || image.id}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Propiedades de la variante */}
              {properties.length > 0 && (
                <div>
                  <Label className="text-base font-medium mb-3 block">Color</Label>
                  <div className="grid grid-cols-1 gap-4">
                    {properties.map((property) => (
                      <div key={property.id}>
                        <Select
                          value={currentVariant?.attr[property.name] || ""}
                          onValueChange={(value) => updateVariantField(`attr.${property.name}`, value)}
                        >
                          <SelectTrigger id={`attr.${property.name}`} className="bg-background border-muted">
                            <SelectValue placeholder={`Seleccionar ${property.name.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {property.values.map(
                              (value) =>
                                value.value.trim() !== "" && (
                                  <SelectItem key={value.id} value={value.value}>
                                    {value.value}
                                  </SelectItem>
                                ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="unit_price" className="text-base font-medium block mb-3">Precio de venta</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="unit_price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7 bg-background border-muted"
                      value={currentVariant?.unit_price || ""}
                      onChange={(e) => updateVariantField("unit_price", Number.parseFloat(e.target.value) || 0)}
                      disabled={useGlobalPrices}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="promotionalPrice" className="text-base font-medium block mb-3">Precio promocional</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="promotionalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7 bg-background border-muted"
                      value={currentVariant?.promotionalPrice || ""}
                      onChange={(e) => {
                        const value = e.target.value ? Number.parseFloat(e.target.value) : null
                        updateVariantField("promotionalPrice", value)
                      }}
                      disabled={useGlobalPrices}
                    />
                  </div>
                </div>
              </div>

              {/* --- Input de Stock (Condicional) --- */}
              {stockManagement && (
                <div>
                  <Label htmlFor="stock" className="text-base font-medium block mb-3">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="1" // Stock usualmente son enteros
                    className="bg-background border-muted"
                    placeholder="Cantidad disponible"
                    value={currentVariant?.stock ?? ""} // Usar ?? para mostrar string vacío si es null
                    onChange={(e) => {
                      // Convertir a número o null si está vacío
                      const value = e.target.value === '' ? null : Number.parseInt(e.target.value, 10);
                      // Asegurarse de que no sea NaN, si lo es, mantener null o 0? Optemos por null.
                      const stockValue = isNaN(value as number) ? null : value;
                      updateVariantField("stock", stockValue)
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Cantidad de unidades disponibles para esta variante específica.
                  </p>
                </div>
              )}
              {/* --- Fin Input de Stock --- */}

              <div>
                <Label htmlFor="cost" className="text-base font-medium block mb-3">Costo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-7 bg-background border-muted"
                    value={currentVariant?.cost || ""}
                    onChange={(e) => updateVariantField("cost", Number.parseFloat(e.target.value) || 0)}
                    disabled={useGlobalPrices}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Es de uso interno, tus clientes no lo verán</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button"
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                onClick={(e) => e.stopPropagation()}
              >
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Drawer para propiedades */}
      <PropertiesDrawer
        open={isPropertiesDrawerOpen}
        onOpenChange={setIsPropertiesDrawerOpen}
        properties={properties}
        onPropertiesChange={setProperties}
        onGenerateVariants={generateVariants}
      />
    </div>
  )
}
