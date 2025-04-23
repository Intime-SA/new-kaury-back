"use client"

import { useState, useEffect } from "react"
import { getImageUrlForSize } from "@/lib/image-processor"

interface ResponsiveImageProps {
  filename: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

export function ResponsiveImage({
  filename,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false)

  // Definir los tamaños para srcset
  const imageSizes = [50, 100, 240, 320, 480, 640, 1024]

  // Construir el srcset con todas las resoluciones disponibles
  const srcSet = imageSizes.map((size) => `${getImageUrlForSize(filename, size)} ${size}w`).join(", ")

  // URL por defecto (la más grande)
  const defaultSrc = getImageUrlForSize(filename, 1024)

  useEffect(() => {
    if (priority) {
      // Precargar la imagen si es prioritaria
      const img = new Image()
      img.src = defaultSrc
      img.onload = () => setLoaded(true)
    } else {
      setLoaded(true)
    }
  }, [defaultSrc, priority])

  return (
    <>
      <img
        src={defaultSrc || "/placeholder.svg"}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={`${className} ${!loaded ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        loading={priority ? "eager" : "lazy"}
      />
      {!loaded && <div className="absolute inset-0 bg-muted animate-pulse rounded-lg"></div>}
    </>
  )
}
