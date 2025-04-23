import { v4 as uuidv4 } from "uuid"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage"
import type { ProductImage } from "@/types/types"

// Tamaños de imagen para generar (en píxeles)
export const IMAGE_SIZES = [50, 100, 240, 320, 480, 640, 1024]

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// --- Inicialización de Firebase mejorada ---
let app
// Evitar inicializar múltiples veces en entornos como HMR de Next.js
if (!getApps().length) {
  try {
    if (firebaseConfig.apiKey && firebaseConfig.storageBucket) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase inicializado (nueva instancia)")
    } else {
      console.error("Faltan variables de entorno de Firebase para inicializar.")
    }
  } catch (error) {
    console.error("Error al inicializar Firebase:", error)
  }
} else {
  app = getApp() // Obtener la instancia existente
  console.log("Firebase ya estaba inicializado (instancia existente)")
}
// Asegurarse de que storage solo se obtiene si app existe
const storage: FirebaseStorage | null = app ? getStorage(app) : null;
if (!storage) {
    console.error("Firebase Storage no pudo ser inicializado.")
}
// --- Fin Inicialización ---

/**
 * Convierte una imagen a formato WebP y la redimensiona
 * @param file Archivo de imagen original
 * @param width Ancho deseado en píxeles
 * @param quality Calidad de la imagen (0-100)
 * @returns Promise con el blob de la imagen WebP
 */
export async function convertToWebP(file: File, width: number, quality = 80): Promise<Blob> {
  console.log(`Iniciando conversión a WebP: ${file.name}, ancho: ${width}px, calidad: ${quality}`)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous" // Necesario si la imagen se carga de una URL externa

    img.onload = () => {
      try {
        console.log(`Imagen cargada para WebP: ${img.width}x${img.height}`)
        const ratio = img.height / img.width
        const height = Math.round(width * ratio)
        console.log(`Redimensionando para WebP a: ${width}x${height}`)

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return reject(new Error("No se pudo obtener el contexto del canvas para WebP"))
        }
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Conversión a WebP exitosa (tamaño ${width}px): ${blob.size} bytes`)
              resolve(blob)
            } else {
              reject(new Error(`Error al convertir a WebP (tamaño ${width}px)`))
            }
          },
          "image/webp",
          quality / 100
        )
      } catch (error) {
        console.error(`Error en procesamiento WebP (tamaño ${width}px):`, error)
        reject(error)
      } finally {
         // Liberar memoria del Object URL si se creó uno
         if (img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
         }
      }
    }
    img.onerror = (error) => {
      console.error(`Error al cargar imagen para WebP: ${file.name}`, error)
      reject(new Error(`Error al cargar la imagen: ${file.name}`))
       // Liberar memoria del Object URL si se creó uno
       if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
       }
    }
    // Crear Object URL para cargar la imagen en el elemento Image
    img.src = URL.createObjectURL(file)
    console.log(`Object URL creada para ${file.name}: ${img.src}`)
  })
}

/**
 * Comprime la imagen original manteniendo alta calidad.
 * @param file Archivo de imagen original
 * @param quality Calidad deseada (0-1)
 * @returns Promise con el blob de la imagen comprimida
 */
async function compressOriginalImage(file: File, quality = 0.95): Promise<{ blob: Blob; extension: string }> {
  console.log(`Iniciando compresión original: ${file.name}, calidad: ${quality}`)
  const validTypesForCanvas = ["image/jpeg", "image/png", "image/webp"] // Añadir otros si es necesario
  const outputType = validTypesForCanvas.includes(file.type) ? file.type : "image/jpeg" // Usar JPEG como fallback
  const extension = outputType.split('/')[1] || 'jpg'

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        console.log(`Imagen cargada para compresión original: ${img.width}x${img.height}`)
        // Usar dimensiones originales
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return reject(new Error("No se pudo obtener el contexto del canvas para compresión original"))
        }
        ctx.drawImage(img, 0, 0, img.width, img.height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Compresión original exitosa (${outputType}): ${blob.size} bytes`)
              resolve({ blob, extension })
            } else {
              reject(new Error("Error al comprimir imagen original"))
            }
          },
          outputType,
          quality
        )
      } catch (error) {
        console.error("Error en compresión original:", error)
        reject(error)
      } finally {
          if (img.src.startsWith('blob:')) {
             URL.revokeObjectURL(img.src);
          }
      }
    }
    img.onerror = (error) => {
      console.error(`Error al cargar imagen para compresión original: ${file.name}`, error)
      reject(new Error(`Error al cargar la imagen original: ${file.name}`))
       if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
       }
    }
    img.src = URL.createObjectURL(file)
     console.log(`Object URL creada para original ${file.name}: ${img.src}`)
  })
}

/**
 * Sube una imagen a Firebase Storage en múltiples tamaños WebP y el original comprimido.
 * @param file Archivo de imagen original
 * @returns Promise con un objeto que contiene la URL original (comprimida), las URLs de los tamaños WebP y el nombre base.
 */
export async function uploadImageToFirebase(file: File): Promise<{
  originalUrl: string
  sizes: Record<number, string>
  filename: string // Nombre base sin extensión
}> {
  console.log(`Iniciando subida completa a Firebase: ${file.name}, tipo: ${file.type}, tamaño: ${file.size} bytes`)

  if (!storage) {
    console.error("Firebase Storage no está inicializado al intentar subir.")
    throw new Error("Firebase Storage no está inicializado. Verifica la configuración y los logs.")
  }

  // --- Metadata de Caché ---
  const cacheMetadata = {
    cacheControl: 'public, max-age=31536000', // 1 año de caché
  };
  console.log("Metadata de caché configurada:", cacheMetadata);


  try {
    // Generar un ID único como nombre base
    const uniqueId = uuidv4()
    const filename = `${uniqueId}` // Nombre base sin extensión
    console.log(`Nombre de archivo base generado: ${filename}`)

    const webpUrls: Record<number, string> = {}
    let finalOriginalUrl = "" // Variable para guardar la URL del original comprimido

    // --- Promesas de Subida ---
    const uploadPromises: Promise<any>[] = []

    // 1. Promesas para los tamaños WebP
    IMAGE_SIZES.forEach((size) => {
      const webpPromise = convertToWebP(file, size)
        .then(webpBlob => {
          const storagePath = `webp/${filename}-${size}-0.webp`
          console.log(`Subiendo WebP tamaño ${size} a: ${storagePath}`)
          const storageRef = ref(storage, storagePath)
          return uploadBytes(storageRef, webpBlob, cacheMetadata) // Añadir metadata
            .then(() => getDownloadURL(storageRef))
            .then(url => {
              console.log(`URL WebP obtenida (tamaño ${size}): ${url}`)
              webpUrls[size] = url
            })
        })
        .catch(error => {
             console.error(`Fallo al procesar/subir WebP tamaño ${size}:`, error);
             // Opcional: decidir si fallar todo o continuar sin este tamaño
        });
      uploadPromises.push(webpPromise)
    })

    // 2. Promesa para el original comprimido
    const originalPromise = compressOriginalImage(file)
      .then(({ blob: originalBlob, extension }) => {
        const storagePath = `original/${filename}.${extension}` // Ruta para el original
        console.log(`Subiendo original comprimido a: ${storagePath}`)
        const storageRef = ref(storage, storagePath)
        return uploadBytes(storageRef, originalBlob, cacheMetadata) // Añadir metadata
          .then(() => getDownloadURL(storageRef))
          .then(url => {
            console.log(`URL original comprimida obtenida: ${url}`)
            finalOriginalUrl = url // Guardar la URL final del original
          })
      })
       .catch(error => {
             console.error(`Fallo al procesar/subir original comprimido:`, error);
             // Opcional: decidir si fallar toda la subida
             throw error; // Re-lanzar para que Promise.all falle si el original falla
        });
    uploadPromises.push(originalPromise)

    // Esperar a que todas las subidas (WebP y original) se completen
    console.log(`Esperando ${uploadPromises.length} subidas...`)
    await Promise.all(uploadPromises)
    console.log(`Todas las subidas completadas`)

    if (!finalOriginalUrl) {
        throw new Error("La URL de la imagen original comprimida no se pudo obtener.");
    }

    return {
      originalUrl: finalOriginalUrl, // Retornar la URL del original comprimido
      sizes: webpUrls,
      filename, // Retornar el nombre base
    }
  } catch (error) {
    console.error("Error general durante el proceso de subida de imágenes:", error)
    // Asegurarse de que el error se propague para que el componente UI lo maneje
    throw error
  }
}

/**
 * Crea un objeto ProductImage a partir de los resultados de la subida
 * @param uploadResult Resultado de uploadImageToFirebase
 * @param position Posición de la imagen en la galería
 * @returns Objeto ProductImage listo para guardar en la base de datos
 */
export function createProductImage(
  uploadResult: { originalUrl: string; filename: string; sizes: Record<number, string> },
  position: number,
): ProductImage {
  return {
    // Usar un ID diferente si es necesario, Date.now() puede colisionar
    id: uuidv4(), // Usar uuidv4 también para el ID del objeto
    product_id: 0, // Asignar según sea necesario
    src: uploadResult.originalUrl, // URL del original comprimido
    filename: uploadResult.filename, // Nombre base para construir otras URLs
    position,
    alt: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Opcional: añadir las URLs de los tamaños si se necesitan en el objeto ProductImage
    // sizes: uploadResult.sizes
  }
}

/**
 * Obtiene la URL para un tamaño específico de imagen WebP
 * @param filename Nombre base del archivo
 * @param size Tamaño deseado
 * @returns URL completa para el tamaño especificado
 */
export function getImageUrlForSize(filename: string, size: number): string {
  const availableSizes = [...IMAGE_SIZES].sort((a, b) => a - b)
  // Encontrar el tamaño disponible más cercano o igual
  const closestSize = availableSizes.reduce((prev, curr) => {
      return Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  }, availableSizes[0] ?? size); // Fallback al tamaño solicitado si availableSizes está vacío

  // Construir la URL del bucket de Firebase para WebP
  // Asegúrate que la URL base sea correcta para tu bucket
  const bucketBaseUrl = `https://storage.googleapis.com/${firebaseConfig.storageBucket || 'mayoristakaurymdp.appspot.com'}`;
  return `${bucketBaseUrl}/webp/${filename}-${closestSize}-0.webp`;
}
