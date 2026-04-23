"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { GripVertical, ImageIcon, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/products/upload/image-uploader";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { removeImage, reorderImages } from "@/store/slices/productsSlice";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export function ImagesSection() {
  const images = useSelector((state: RootState) => state.products.images);
  const dispatch = useDispatch();

  const handleDeleteImage = (idToDelete: string | number) => {
    dispatch(removeImage(idToDelete));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const next = Array.from(images);
    const [removed] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, removed);
    dispatch(reorderImages(next));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6" />
          Imágenes del Producto
        </CardTitle>
        <CardDescription>
          Sube y gestiona las imágenes de tu producto. La primera imagen será la
          principal. Arrastra con el asa para cambiar el orden.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUploader />

        {images.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-base font-medium mb-4">
              Imágenes Cargadas ({images.length})
            </h4>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="product-images" direction="horizontal">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
                  >
                    {images.map((image, index) => (
                      <Draggable
                        key={`product-image-${String(image.id)}`}
                        draggableId={`product-image-${String(image.id)}`}
                        index={index}
                      >
                        {(draggableProvided, snapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            className={cn(
                              "relative aspect-square border rounded-lg overflow-hidden group shadow-md bg-muted/20 touch-manipulation",
                              snapshot.isDragging &&
                                "z-50 ring-2 ring-primary shadow-lg"
                            )}
                            style={draggableProvided.draggableProps.style}
                          >
                            <Image
                              src={
                                image.url?.replace("original", "small") ||
                                image.src?.replace("original", "small")
                              }
                              alt={`Imagen ${index + 1}${image.filename ? ` - ${image.filename}` : ""}`}
                              fill
                              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16.67vw"
                              draggable={false}
                              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 pointer-events-none select-none"
                            />
                            <button
                              type="button"
                              {...draggableProvided.dragHandleProps}
                              className="absolute bottom-1 right-1 z-20 flex h-8 w-8 items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow border cursor-grab active:cursor-grabbing hover:bg-background hover:text-foreground"
                              aria-label="Arrastrar para reordenar"
                            >
                              <GripVertical className="h-4 w-4" />
                            </button>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 pointer-events-auto"
                                onClick={() => handleDeleteImage(image.id)}
                                aria-label="Eliminar imagen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {index === 0 && (
                              <span className="absolute top-1 left-1 z-10 bg-primary text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full">
                                Principal
                              </span>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
