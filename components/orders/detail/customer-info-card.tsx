"use client"

import { Mail, Phone, MapPin, User, FileText, Home, MapPinned, Building } from "lucide-react"
import type { InfoEntrega } from "@/types/orders"

interface CustomerInfoCardProps {
  info: InfoEntrega
}

export function CustomerInfoCard({ info }: CustomerInfoCardProps) {
  const fields = [
    { key: 'name', icon: User, label: 'Nombre', value: info.name ? `${info.name} ${info.apellido}` : null },
    { key: 'email', icon: Mail, label: 'Email', value: info.email },
    { key: 'telefono', icon: Phone, label: 'Teléfono', value: info.telefono },
    { key: 'dni', icon: FileText, label: 'DNI', value: info.dni },
    { key: 'calle', icon: MapPin, label: 'Calle', value: info.calle ? `${info.calle} ${info.numero}` : null },
    { key: 'barrio', icon: Home, label: 'Barrio', value: info.barrio },
    { key: 'ciudad', icon: Building, label: 'Ciudad', value: info.ciudad },
    { key: 'estado', icon: MapPinned, label: 'Estado', value: info.estado },
    { key: 'codigoPostal', icon: MapPin, label: 'Código Postal', value: info.codigoPostal },
    { key: 'pisoDpto', icon: Building, label: 'Piso/Dpto', value: info.pisoDpto }
  ]

  const existingFields = fields.filter(field => field.value && field.value.trim() !== '')

  if (existingFields.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Información del Cliente</h3>
      <div className="space-y-3">
        {existingFields.map(field => (
          <div key={field.key} className="flex items-center gap-2">
            <field.icon className="h-4 w-4 text-muted-foreground" />
            <span>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 