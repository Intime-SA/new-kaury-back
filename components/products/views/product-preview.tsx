"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tag, ExternalLink, PlayCircle } from "lucide-react"
import Image from "next/image"
import type { ProductImage, ProductVariant } from "@/types/types"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"

interface ProductPreviewProps {
  name: string
  description: string
  price: number
  discountPrice: number | null
  tags: string[]
  categories: { name: { es: string } }[]
  freeShipping: boolean
  variants: ProductVariant[]
  videoURL?: string | null
}

export function ProductPreview({
  name,
  description,
  price,
  discountPrice,
  tags,
  categories,
  freeShipping,
  variants,
  videoURL
}: ProductPreviewProps) {
  const images = useSelector((state: RootState) => state.products.images);

  const hasVideo = videoURL && videoURL.trim() !== ""
  
  const openVideo = () => {
    if (hasVideo) {
      window.open(videoURL, '_blank')
    }
  }

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  )

  const hasDiscount = discountPrice !== undefined && discountPrice !== null && discountPrice < price
  const discountPercentage = hasDiscount ? Math.round(((price - discountPrice!) / price) * 100) : 0

  console.log("Video URL:", videoURL)

  const variantAttributes: Record<string, Set<string>> = {}

  if (variants && variants.length > 0) {
    variants.forEach((variant) => {
      Object.entries(variant.attr).forEach(([key, value]) => {
        if (!variantAttributes[key]) {
          variantAttributes[key] = new Set()
        }
        variantAttributes[key].add(value)
      })
    })
  }

  return (
    <div className="sticky top-6">
      <Card className="overflow-hidden">
        <div className="relative">
          <Carousel
            plugins={[autoplayPlugin.current]}
            className="w-full"
            opts={{
              loop: images.length > 1,
            }}
          >
            <CarouselContent className="-ml-0">
              {images.length > 0 ? (
                images.map((image, index) => (
                  <CarouselItem key={image.id || index} className="pl-0">
                    <div className="relative aspect-square">
                      <Image
                        src={image.src}
                        alt={name || `Imagen ${index + 1}`}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="pl-0">
                   <div className="relative aspect-square">
                      <Image src="/placeholderkaury2.png" alt="Sin imagen" fill className="object-cover" />
                   </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {images.length > 1 && (
               <>
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex" />
               </>
             )}
          </Carousel>
          {freeShipping && (
            <Badge className="absolute top-2 right-2 z-20">
              Envío gratis
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-1 mb-3">
            {categories && categories.length > 0 && (
              <div className="text-xs text-muted-foreground">{categories.map((cat) => cat.name.es).join(" / ")}</div>
            )}
            <h3 className="font-medium text-lg line-clamp-2">{name || "Nombre del producto"}</h3>

            {hasVideo && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                onClick={openVideo}
              >
                <PlayCircle className="h-4 w-4" />
                Ver video del producto
              </Button>
            )}

            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold">${discountPrice!.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground line-through">${price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-lg font-bold">${price.toFixed(2)}</span>
              )}
            </div>
          </div>

          {description && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
            </div>
          )}

          {Object.keys(variantAttributes).length > 0 && (
            <div className="mt-4">
              {Object.entries(variantAttributes).map(([attrName, values]) => (
                <div key={attrName} className="mb-3">
                  <div className="text-sm font-medium mb-1">{attrName}:</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(values).map((value) => (
                      <Badge key={value} variant="outline" className="rounded-md">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {tags.map((tag, index) => (
                  <span key={index} className="text-xs text-muted-foreground">
                    {tag}
                    {index < tags.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Cómo se verá en los resultados de búsqueda:</h3>
        <Card className="overflow-hidden">
          <div className="flex">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden">
              <Image
                src={images[0]?.src || "/placeholderkaury2.png"}
                alt={name || "Vista previa del producto"}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 flex-1">
              <h3 className="font-medium text-sm line-clamp-1">{name || "Nombre del producto"}</h3>
              <div className="flex items-center gap-2 mt-1">
                {hasDiscount ? (
                  <>
                    <span className="text-sm font-bold">${discountPrice!.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through">${price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold">${price.toFixed(2)}</span>
                )}
              </div>
              {freeShipping && (
                <Badge className="mt-1 text-xs" variant="secondary">
                  Envío gratis
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
