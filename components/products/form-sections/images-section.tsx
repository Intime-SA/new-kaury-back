"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { ImageUploader } from "@/components/products/image-uploader";
import type { ProductImage } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleUploader } from "../simple-uploader";
import { ResponsiveImage } from "./responsive-image";

interface ImagesSectionProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

export function ImagesSection({ images, onImagesChange }: ImagesSectionProps) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Ejemplo de Subida de Imágenes</h1>

      <div className="mt-4">
        <ImageUploader images={images} onChange={onImagesChange} />
      </div>

    </div>
  );
}
