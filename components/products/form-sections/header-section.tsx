"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Plus } from "lucide-react";
import Link from "next/link";

interface HeaderSectionProps {
  context: "create" | "edit";
  onSaveComplete: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function HeaderSection({
  context,
  onSaveComplete,
  onSubmit,
  isSubmitting,
}: HeaderSectionProps) {
  return (
    <>
      <div className="pb-4">
        <Link href="/products/list">
          <ArrowLeft className="h-10 w-10" />
        </Link>
      </div>
      <div className="flex justify-between items-center mb-6 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              {context === "edit" ? "Editar Producto" : "Nuevo Producto"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Completa la información de tu producto
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <Link href="/products/list">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
          <div>
            <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {context === "edit" ? "Guardar cambios" : "Crear producto"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
