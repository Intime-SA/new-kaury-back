"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploader } from "@/components/products/image-uploader";
import { VariantsManager } from "@/components/products/variants-manager";
import { TagsInput } from "@/components/products/tags-input";
import { toast } from "@/components/ui/use-toast";
import {
  Wand2,
  ExternalLink,
  Plus,
  Edit,
  ArrowLeft,
  Package,
  ImageIcon,
  Tags,
  Boxes,
  Barcode,
  Weight,
  Star,
  Settings,
  Store,
  Info,
  ShoppingCart,
  Instagram,
  Video,
  Link2,
  ShoppingBag,
  Box,
  Radio,
  Globe,
  Cloud,
  Infinity,
  CircleDot,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductPreview } from "@/components/products/product-preview";
import { ProductImage, ProductVariant } from "@/types/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  setProductName,
  setProductDescription,
  setPublished,
  setFreeShipping,
  setProductType,
  setStockManagement,
  setImages,
  setVariants,
  setCategories,
  addCategory,
  removeCategory,
  SelectedCategory,
  setTags,
  setVideoURL,
  setSKU,
  setBarcode,
  setDimensions,
  setMPN,
  setAgeRange,
  setGender,
  setShowInStore,
  resetForm,
  setFormData,
  ProductFormState,
} from "@/store/slices/productsSlice";
import { useProducts } from "@/hooks/products/useProducts"
import { CategoriesSelector } from "../categories/categories-selector";

// Define types for Product, ProductImage, ProductCategory, and ProductVariant
interface Product {
  id: string;
  name: { es: string };
  description: { es: string };
  published: boolean;
  freeShipping: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  categories: ProductCategory[];
  tags: string[];
  urls: {
    videoURL: string | null;
  };
  sku?: string;
  barcode?: string;
  dimensions?: {
    weight: string;
    width: string;
    height: string;
    depth: string;
  };
  mpn?: string;
  ageRange?: string;
  gender?: string;
  showInStore?: boolean;
}

interface ProductCategory {
  id: string;
  name: { es: string };
}

const productSchema = z.object({
  name: z.object({
    es: z.string().min(1, "El nombre es requerido"),
  }),
  description: z.object({
    es: z.string().optional(),
  }),
  published: z.boolean().default(true),
  freeShipping: z.boolean().default(false),
  productType: z.enum(["physical", "digital"]),
  stockManagement: z.enum(["infinite", "limited"]),
  tags: z.array(z.string()).optional(),
  urls: z.object({
    videoURL: z.string().optional().nullable(),
  }),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z
    .object({
      weight: z.string().optional(),
      depth: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
    })
    .optional(),
  mpn: z.string().optional(),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  showInStore: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  context: "create" | "edit";
  product?: Product | null;
  onSaveComplete?: () => void;
}

export function ProductForm({ context, product, onSaveComplete }: ProductFormProps) {
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
  const dispatch = useDispatch();
  const selectedCategories = useSelector((state: RootState) => state.products.categories);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createProduct } = useProducts();

  // Manejador para agregar categoría
  const handleAddCategory = (category: SelectedCategory) => {
    dispatch(addCategory(category));
  };

  // Manejador para remover categoría
  const handleRemoveCategory = (categoryId: string) => {
    dispatch(removeCategory(categoryId));
  };

  // Manejador para establecer categorías
  const handleSetCategories = (categories: SelectedCategory[]) => {
    dispatch(setCategories(categories));
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || { es: '' },
      description: product?.description || { es: '' },
      published: product?.published ?? true,
      freeShipping: product?.freeShipping ?? false,
      productType: (product?.variants[0]?.stockManagement ? "physical" : "digital") as "physical" | "digital",
      stockManagement: (product?.variants[0]?.stockManagement ? "limited" : "infinite") as "infinite" | "limited",
      tags: product?.tags || [],
      urls: product?.urls || { videoURL: null },
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      dimensions: product?.dimensions || {
        weight: '',
        width: '',
        height: '',
        depth: '',
      },
      mpn: product?.mpn || '',
      ageRange: product?.ageRange || '',
      gender: product?.gender || '',
      showInStore: product?.showInStore ?? true,
    }
  });

  // Manejadores de cambios
  const handleImagesChange = (newImages: ProductImage[]) => {
    setImages(newImages);
  };

  const handleVariantsChange = (newVariants: ProductVariant[]) => {
    setVariants(newVariants);
  };

  // Función para transformar las categorías al formato esperado por la API
  const transformCategoriesForApi = (categories: SelectedCategory[]) => {
    const mainCategories = categories.filter(cat => !cat.parentId);
    
    return mainCategories.map(mainCat => {
      const subcategories = categories
        .filter(cat => cat.parentId === mainCat.id)
        .map(subCat => ({
          id: subCat.id,
          name: subCat.name
        }));

      return {
        id: mainCat.id,
        name: mainCat.name,
        subcategories: subcategories.length > 0 ? subcategories : undefined
      };
    });
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      const transformedCategories = transformCategoriesForApi(selectedCategories);
      
      const productData = {
        ...data,
        images,
        variants,
        categories: transformedCategories,
      };

      if (context === "edit" && product) {
        /* await updateProduct(product.id, productData); */
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        });
      } else {
        const result = await createProduct.mutateAsync(productData as ProductFormState);
        
        if (result.status === 'success') {
          toast({
            title: "Éxito",
            description: "Producto creado correctamente",
          });
          // Resetear el formulario y el estado de Redux
          form.reset();
          setImages([]);
          setVariants([]);
          dispatch(setCategories([]));
        } else {
          throw new Error(result.message || 'Error al crear el producto');
        }
      }

      onSaveComplete?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar el producto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modificar los campos de dimensiones para usar el formulario directamente
  const handleDimensionChange = (field: 'weight' | 'depth' | 'width' | 'height', value: string) => {
    form.setValue(`dimensions.${field}`, value);
  };

  const generateDescription = () => {
    const productName = form.getValues("name").es;
    if (!productName) {
      toast({
        title: "Error",
        description: "Primero debes ingresar un nombre de producto",
        variant: "destructive",
      });
      return;
    }

    // Simulación de generación con IA
    const descriptions = [
      `Este ${productName} de alta calidad está diseñado para ofrecer máxima durabilidad y estilo. Perfecto para uso diario.`,
      `Nuestro ${productName} premium combina funcionalidad y diseño elegante. Fabricado con los mejores materiales.`,
      `Descubre la calidad superior de este ${productName}, creado pensando en la comodidad y resistencia que necesitas.`,
    ];

    const randomDescription =
      descriptions[Math.floor(Math.random() * descriptions.length)];
    form.setValue("description", { es: randomDescription });
  };

  // Obtener el precio para la vista previa
  const previewPrice =
    variants.length > 0 ? variants[0].unit_price : 0;
  const previewDiscountPrice =
    variants.length > 0
      ? variants[0].promotionalPrice
      : null;

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Header */}
      <Button
        variant="ghost"
        size="icon"
        className="mb-6"
        onClick={onSaveComplete}
      >
        <ArrowLeft className="h-10 w-10" />
      </Button>
      <div className="flex justify-between items-center mb-6 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              {context === "edit" ? "Editar Producto" : "Nuevo Producto"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Completa la información de tu producto
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSaveComplete}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {context === "edit" ? "Guardar cambios" : "Crear producto"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-background text-foreground">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Información básica */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Info className="h-10 w-10" />
                  <div>
                    <CardTitle>Información básica</CardTitle>
                    <CardDescription>
                      Información principal del producto
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name.es"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <FormLabel>Nombre</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Ej: Campera de cuero"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description.es"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            <FormLabel>Descripción</FormLabel>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-muted text-muted-foreground"
                            >
                              Próximamente
                            </Badge>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generateDescription}
                              disabled
                            >
                              <Wand2 className="mr-2 h-4 w-4" />
                              Generar con IA
                            </Button>
                          </div>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu producto..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="physical"
                                  id="physical"
                                />
                                <Label htmlFor="physical">Producto</Label>

                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="digital" id="digital" />
                                <Label htmlFor="digital">
                                  Digital / Servicios
                                </Label>
                                <Cloud className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stockManagement"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="infinite" id="infinite" />
                                <Label htmlFor="infinite">Sin límite</Label>
                                <Infinity className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="limited" id="limited" />
                                <Label htmlFor="limited">Limitado</Label>
                                <CircleDot className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="urls.videoURL"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <FormLabel>Link externo (video)</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="https://youtube.com/watch?v=..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Pega un link de YouTube o de Vimeo sobre tu producto
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Imágenes */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <ImageIcon className="h-10 w-10" />
                  <div>
                    <CardTitle>Imágenes</CardTitle>
                    <CardDescription>
                      Agrega imágenes para mostrar tu producto
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    images={images}
                    onChange={handleImagesChange}
                  />
                </CardContent>
              </Card>

              {/* Variantes y precios */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Boxes className="h-10 w-10" />
                  <div>
                    <CardTitle>Variantes y precios</CardTitle>
                    <CardDescription>
                      Configura las variantes, precios y stock de tu producto
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <VariantsManager
                    variants={variants}
                    onChange={handleVariantsChange}
                    stockManagement={form.watch("stockManagement") === "limited"}
                    images={images}
                  />
                </CardContent>
              </Card>

              {/* Códigos */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Barcode className="h-10 w-10" />
                  <div>
                    <CardTitle>Códigos</CardTitle>
                    <CardDescription>
                      Información para identificar tu producto
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="SKU" {...field} />
                        </FormControl>
                        <FormDescription>
                          El SKU es un código que creás internamente para hacer
                          un seguimiento de tus productos con variantes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de barras</FormLabel>
                        <FormControl>
                          <Input placeholder="Código de barras" {...field} />
                        </FormControl>
                        <FormDescription>
                          El código de barras consta de 13 números y se utiliza
                          para identificar un producto.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Peso y dimensiones */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Weight className="h-10 w-10" />
                  <div>
                    <CardTitle>Peso y dimensiones</CardTitle>
                    <CardDescription>
                      Ingresá los datos para calcular el costo de envío
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="dimensions.weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso</FormLabel>
                          <div className="flex">
                            <FormControl>
                              <Input 
                                placeholder="0.14" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleDimensionChange('weight', e.target.value);
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                              kg
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dimensions.depth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profundidad</FormLabel>
                          <div className="flex">
                            <FormControl>
                              <Input 
                                placeholder="30" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleDimensionChange('depth', e.target.value);
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                              cm
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dimensions.width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ancho</FormLabel>
                          <div className="flex">
                            <FormControl>
                              <Input 
                                placeholder="30" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleDimensionChange('width', e.target.value);
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                              cm
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dimensions.height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alto</FormLabel>
                          <div className="flex">
                            <FormControl>
                              <Input 
                                placeholder="30" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleDimensionChange('height', e.target.value);
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                              cm
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 flex items-center"
                    >
                      <span>Más sobre calcular el peso y las dimensiones</span>
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Instagram y Google Shopping */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <div className="flex gap-1">
                    <Instagram className="h-10 w-10" />
                  </div>
                  <div className="w-full">
                    <CardTitle className="flex justify-between items-center gap-2">
                      Instagram y Google Shopping
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Próximamente
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Destacá tus productos en las vidrieras virtuales de
                      Instagram y Google gratuitamente.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="opacity-50 pointer-events-none">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="mpn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MPN</FormLabel>
                          <FormControl>
                            <Input placeholder="MPN" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ageRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rango de edad</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccioná el rango de edad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="adult">Adulto</SelectItem>
                              <SelectItem value="teen">Adolescente</SelectItem>
                              <SelectItem value="child">Niño</SelectItem>
                              <SelectItem value="infant">Bebé</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccioná el sexo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Masculino</SelectItem>
                              <SelectItem value="female">Femenino</SelectItem>
                              <SelectItem value="unisex">Unisex</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 flex items-center"
                      disabled
                    >
                      <span>¿Cómo completar estos datos?</span>
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categorías */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Tags className="h-10 w-10" />
                  <div>
                    <CardTitle>Categorías</CardTitle>
                    <CardDescription>
                      Ayudá a tus clientes a encontrar más rápido tus productos
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <CategoriesSelector 
                    selectedCategories={selectedCategories}
                    onAddCategory={handleAddCategory}
                    onRemoveCategory={handleRemoveCategory}
                    onSetCategories={handleSetCategories}
                  />
                </CardContent>
              </Card>

              {/* Tags, Marca y SEO */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Star className="h-10 w-10" />
                  <div className="w-full">
                    <CardTitle className="flex justify-between items-center gap-2">
                      Tags, Marca y SEO
                      <div className="inline-flex items-center gap-2 text-sm font-normal text-blue-600 ml-2">
                        <Wand2 className="h-3 w-3" />
                        Generar con IA
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground text-xs"
                        >
                          Próximamente
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Creá palabras clave y facilitá la búsqueda
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Etiquetas</FormLabel>
                          <Button type="button" variant="ghost" size="sm">
                            <Edit className="h-4 w-4 mr-1" /> Editar
                          </Button>
                        </div>
                        <FormControl>
                          <TagsInput
                            value={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Agrega etiquetas para mejorar la búsqueda de tu
                          producto
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Más opciones */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Settings className="h-10 w-10" />
                  <div>
                    <CardTitle>Más opciones</CardTitle>
                    <CardDescription>
                      Configuraciones adicionales del producto
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="freeShipping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Este producto tiene envío gratis
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showInStore"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mostrar en la tienda</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Publicado</FormLabel>
                          <FormDescription>
                            Este producto será visible en tu tienda
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Store className="h-10 w-10" />
                <div>
                  <CardTitle>Vista previa</CardTitle>
                  <CardDescription>
                    Así se verá tu producto en la tienda
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ProductPreview
                  name={form.watch("name.es") || ""}
                  description={form.watch("description.es") || ""}
                  price={previewPrice}
                  discountPrice={previewDiscountPrice}
                  images={images}
                  tags={form.watch("tags") || []}
                  categories={selectedCategories}
                  freeShipping={form.watch("freeShipping")}
                  variants={variants}
                  videoURL={form.watch("urls.videoURL") || null}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
