"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SidebarOptInForm() {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">¿Necesitas ayuda?</h3>
        <p className="text-xs text-muted-foreground">Contáctanos para obtener soporte</p>
        <div className="mt-2 flex flex-col gap-2">
          <Input placeholder="Email" type="email" />
          <Button size="sm" className="w-full">
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}
