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
    { key: 'calle', icon: MapPin, label: 'Dirección', value: info.calle ? `${info.calle} ${info.numero}` : null },
    { key: 'barrio', icon: Home, label: 'Barrio', value: info.barrio },
    { key: 'ciudad', icon: Building, label: 'Ciudad', value: info.ciudad },
    { key: 'estado', icon: MapPinned, label: 'Provincia', value: info.estado },
    { key: 'codigoPostal', icon: MapPin, label: 'CP', value: info.codigoPostal },
    { key: 'pisoDpto', icon: Building, label: 'Piso/Dpto', value: info.pisoDpto }
  ]

  const existingFields = fields.filter(field => field.value && field.value.trim() !== '')

  if (existingFields.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Información del cliente
      </h3>
      <div className="rounded-xl border border-border/70 bg-card divide-y divide-border/40">
        {existingFields.map((field) => (
          <div key={field.key} className="flex items-center gap-2.5 px-3 py-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
              <field.icon className="h-3 w-3" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{field.label}</p>
              <p className="text-xs text-foreground truncate">{field.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
