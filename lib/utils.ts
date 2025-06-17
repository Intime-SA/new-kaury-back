import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatFirebaseTimestamp = (timestamp: { _seconds: number; _nanoseconds: number }) => {
  const date = new Date(timestamp._seconds * 1000)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatISODate = (isoString: string | null | undefined): string => {
  if (!isoString) return '-';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error al formatear fecha ISO:', error);
    return 'Error de formato';
  }
}