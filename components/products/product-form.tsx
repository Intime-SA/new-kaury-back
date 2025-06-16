"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  setCategories,
  addCategory,
  removeCategory,
  type SelectedCategory,
  type ProductFormState,
} from "@/store/slices/productsSlice";
import { useProducts } from "@/hooks/products/useProducts";
import type { ProductImage, ProductVariant } from "@/types/types";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

// Import all the form section components
import { HeaderSection } from "@/components/products/form-sections/header-section";
import { BasicInfoSection } from "@/components/products/form-sections/basic-info-section";
import { ImagesSection } from "@/components/products/form-sections/images-section";
import { VariantsSection } from "@/components/products/variants-section";
import { CodesSection } from "@/components/products/form-sections/codes-section";
import { DimensionsSection } from "@/components/products/form-sections/dimensions-section";
import { SocialSection } from "@/components/products/form-sections/social-section";
import { CategoriesSection } from "@/components/products/form-sections/categories-section";
import { TagsSection } from "@/components/products/form-sections/tags-section";
import { OptionsSection } from "@/components/products/form-sections/options-section";
import { PreviewSection } from "@/components/products/form-sections/preview-section";
import { ImportProductsSection } from "@/components/products/ImportProductsSection";

// Define types for Product, ProductImage, ProductCategory, and ProductVariant
interface Product {
  id: string;
  name: { es: string };
  description: { es: string };
  freeShipping: boolean;
  featured: boolean;
  stockManagement: boolean;
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
    weight?: string;
    width?: string;
    height?: string;
    depth?: string;
  };
  mpn?: string;
  ageRange?: string;
  gender?: string;
  showInStore?: boolean;
  useGlobalPrices?: boolean;
  globalUnitPrice?: number | null;
  globalPromotionalPrice?: number | null;
  globalCost?: number | null;
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
  freeShipping: z.boolean().default(false),
  featured: z.boolean().default(false),
  productType: z.enum(["physical", "digital"]),
  stockManagement: z.boolean(),
  tags: z.array(z.string()).optional(),
  urls: z.object({
    videoURL: z.string().optional().nullable(),
  }),
  sku: z.string().optional(),
  barcode: z.string().optional(),
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
  useGlobalPrices: z.boolean().default(false).optional(),
  globalUnitPrice: z.string().optional().nullable(),
  globalPromotionalPrice: z.string().optional().nullable(),
  globalCost: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  context: "create" | "edit";
  product?: Product | null;
  onSaveComplete?: () => void;
}

interface ApiErrorResponse {
  status: "error";
  message: string;
  errors: {
    formErrors: string[];
    fieldErrors: {
      [key: string]: string[];
    };
  };
}

interface ApiSuccessResponse {
  status: "success";
  message: string;
}

type ApiResponse = ApiErrorResponse | ApiSuccessResponse;

// Función para mapear errores de la API a los campos anidados del formulario
function setApiFieldErrorsDynamically(form: any, fieldErrors: Record<string, string[]>, formValues: any) {
  Object.entries(fieldErrors).forEach(([field, errors]) => {
    const value = formValues[field];
    if (typeof value === 'object' && value !== null) {
      // Si es un objeto, asignar el error a cada subcampo
      Object.keys(value).forEach((subKey) => {
        form.setError(`${field}.${subKey}`, {
          type: "manual",
          message: errors[0],
        });
      });
    } else {
      // Si no, asignar el error directamente
      form.setError(field, {
        type: "manual",
        message: errors[0],
      });
    }
  });
}

// Función para mostrar un toast por cada error de campo
function showFieldErrorsToast(fieldErrors: Record<string, string[]>) {
  Object.entries(fieldErrors).forEach(([key, errors]) => {
    errors.forEach((msg) => {
      toast({
        title: `Error en ${key}`,
        description: msg,
        variant: "destructive",
      });
    });
  });
}

export function ProductForm({
  context,
  product,
  onSaveComplete,
}: ProductFormProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants || []
  );
  const dispatch = useDispatch();
  const selectedCategories = useSelector(
    (state: RootState) => state.products.categories
  );
  const uploadedImages = useSelector(
    (state: RootState) => state.products.images
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createProduct, updateProduct } = useProducts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      name: product?.name || { es: "" },
      description: product?.description || { es: "" },
      freeShipping: product?.freeShipping ?? false,
      featured: product?.featured ?? false,
      productType: (product?.variants[0]?.stockManagement
        ? "physical"
        : "digital") as "physical" | "digital",
      stockManagement: product?.stockManagement ?? true,
      tags: product?.tags || [],
      urls: product?.urls || { videoURL: null },
      sku: product?.sku || "",
      barcode: product?.barcode || "",
      dimensions: product?.dimensions || {
        weight: "",
        width: "",
        height: "",
        depth: "",
      },
      mpn: product?.mpn || "",
      ageRange: product?.ageRange || "",
      gender: product?.gender || "",
      showInStore: product?.showInStore ?? true,
      useGlobalPrices: product?.useGlobalPrices ?? false,
      globalUnitPrice: product?.globalUnitPrice?.toString() ?? "",
      globalPromotionalPrice: product?.globalPromotionalPrice?.toString() ?? "",
      globalCost: product?.globalCost?.toString() ?? "",
    },
  });

  const handleVariantsChange = (newVariants: ProductVariant[]) => {
    setVariants(newVariants);
  };

  // Función para transformar las categorías al formato esperado por la API
  const transformCategoriesForApi = (categories: SelectedCategory[]) => {
    const mainCategories = categories.filter((cat) => !cat.parentId);

    return mainCategories.map((mainCat) => {
      const subcategories = categories
        .filter((cat) => cat.parentId === mainCat.id)
        .map((subCat) => ({
          id: subCat.id,
          name: subCat.name,
        }));

      return {
        id: mainCat.id,
        name: mainCat.name,
        subcategories: subcategories.length > 0 ? subcategories : undefined,
      };
    });
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      const transformedCategories = transformCategoriesForApi(selectedCategories);

      const productData = {
        ...data,
        weight: undefined,
        dimensions: data.dimensions,
        images: uploadedImages,
        variants,
        categories: transformedCategories,
        useGlobalPrices: data.useGlobalPrices,
        globalUnitPrice: data.globalUnitPrice ? parseFloat(data.globalUnitPrice) || null : null,
        globalPromotionalPrice: data.globalPromotionalPrice ? parseFloat(data.globalPromotionalPrice) || null : null,
        globalCost: data.globalCost ? parseFloat(data.globalCost) || null : null,
      };

      if (context === "edit" && product) {
        const result = await updateProduct.mutateAsync({ productId: product.id, productData: productData as ProductFormState }) as ApiResponse;
        
        if (result.status === "error") {
          // Mostrar errores de campos en el formulario de forma dinámica
          if (result.errors?.fieldErrors) {
            setApiFieldErrorsDynamically(form, result.errors.fieldErrors, form.getValues());
            showFieldErrorsToast(result.errors.fieldErrors);
          }
          // Solo mostrar toast si hay errores generales
          if (result.errors?.formErrors && result.errors.formErrors.length > 0) {
            toast({
              title: "Error",
              description: result.errors.formErrors[0],
              variant: "destructive",
            });
          }
          // Si es un error 409 (producto duplicado)
          if (result.message && !result.errors) {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        });
      } else {
        const result = await createProduct.mutateAsync(productData as ProductFormState) as ApiResponse;
        console.log(result, "result");
        
        if (result.status === "error") {
          console.log(result, "result");
          // Mostrar errores de campos en el formulario de forma dinámica
          if (result.errors?.fieldErrors) {
            setApiFieldErrorsDynamically(form, result.errors.fieldErrors, form.getValues());
          }
          // Solo mostrar toast si hay errores generales
          if (result.errors?.formErrors && result.errors.formErrors.length > 0) {
            toast({
              title: "Error",
              description: result.errors.formErrors[0],
              variant: "destructive",
            });
          }
          // Si es un error 409 (producto duplicado)
          if (result.message && !result.errors) {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
          }
          return;
        }

        if (result.status === "success") {
          toast({
            title: "Éxito",
            description: "Producto creado correctamente",
          });
          // Resetear el formulario y el estado de Redux
          form.reset();
          setVariants([]);
          dispatch(setCategories([]));
        }
      }

      onSaveComplete?.();
    } catch (error: any) {
      console.log(error, "error");
      // Mapear errores de campos
      if (error.errors?.fieldErrors) {
        showFieldErrorsToast(error.errors.fieldErrors);
      }
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modificar los campos de dimensiones para usar el formulario directamente
  const handleDimensionChange = (
    field: "weight" | "depth" | "width" | "height",
    value: string
  ) => {
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
  const previewPrice = variants.length > 0 ? variants[0].unit_price : 0;
  const previewDiscountPrice =
    variants.length > 0 ? variants[0].promotionalPrice : null;

  const handleFormSubmit = form.handleSubmit((data) => {
    // Si el modal de variantes está abierto, no permitir el submit
    if (isDialogOpen) {
      return;
    }
    onSubmit(data);
  });



  return (
    <div className="container mx-auto max-w-7xl">
      {/* Header */}
      <HeaderSection
        context={context}
        onSaveComplete={onSaveComplete || (() => {})}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-background text-foreground">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!isDialogOpen) {
                  handleFormSubmit(e);
                }
              }} 
              className="space-y-8"
            >
              {/* Información básica */}
              <BasicInfoSection
                control={form.control}
                generateDescription={generateDescription}
              />

              {/* Imágenes */}
              <ImagesSection />

              {/* Variantes y precios */}
              <VariantsSection
                variants={variants}
                onVariantsChange={handleVariantsChange}
                stockManagement={form.watch("stockManagement")}
                initialUseGlobalPrices={form.watch("useGlobalPrices")}
                onUseGlobalPricesChange={(value) => form.setValue("useGlobalPrices", value)}
                initialGlobalUnitPrice={form.watch("globalUnitPrice")}
                onGlobalUnitPriceChange={(value) => form.setValue("globalUnitPrice", value)}
                initialGlobalPromotionalPrice={form.watch("globalPromotionalPrice")}
                onGlobalPromotionalPriceChange={(value) => form.setValue("globalPromotionalPrice", value)}
                initialGlobalCost={form.watch("globalCost")}
                onGlobalCostChange={(value) => form.setValue("globalCost", value)}
                onDialogOpenChange={setIsDialogOpen}
              />

              {/* Códigos */}
              <CodesSection control={form.control} />

              {/* Peso y dimensiones */}
              <DimensionsSection
                control={form.control}
                handleDimensionChange={handleDimensionChange}
              />

              {/* Instagram y Google Shopping */}
              <SocialSection control={form.control} />

              {/* Categorías */}
              <CategoriesSection
                selectedCategories={selectedCategories}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
                onSetCategories={handleSetCategories}
              />

              {/* Tags, Marca y SEO */}
              <TagsSection control={form.control} />

              {/* Más opciones */}
              <OptionsSection control={form.control} />

              
            </form>
          </Form>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <PreviewSection
              name={form.watch("name.es") || ""}
              description={form.watch("description.es") || ""}
              price={previewPrice}
              discountPrice={previewDiscountPrice}
              tags={form.watch("tags") || []}
              categories={selectedCategories}
              freeShipping={form.watch("freeShipping")}
              variants={variants}
              videoURL={form.watch("urls.videoURL") || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
