"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ImageIcon, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/products/upload/image-uploader";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { removeImage } from "@/store/slices/productsSlice";
import { useEffect } from "react";

export function ImagesSection() {

  const images = useSelector((state: RootState) => state.products.images);
  const dispatch = useDispatch();

  const handleDeleteImage = (idToDelete: string | number) => {
    dispatch(removeImage(idToDelete));
  };

  console.log(images, "images (from Redux)");

  useEffect(() => {
    console.log(images, "images updated in Redux");
  }, [images]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6" />
          Imágenes del Producto
        </CardTitle>
        <CardDescription>
          Sube y gestiona las imágenes de tu producto. La primera imagen será la principal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUploader />

        {images.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-base font-medium mb-4">
              Imágenes Cargadas ({images.length})
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id || `gallery-${index}`}
                  className="relative aspect-square border rounded-lg overflow-hidden group shadow-md bg-muted/20"
                >
                  <Image
                    src={image.url?.replace("original", "small") || image.src?.replace("original", "small")}
                    alt={`Imagen ${index + 1}${image.filename ? ` - ${image.filename}` : ''}`}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16.67vw"
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteImage(image.id)}
                      aria-label="Eliminar imagen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                     <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full">
                       Principal
                     </span>
                   )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
