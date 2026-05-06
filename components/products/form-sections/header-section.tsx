"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

interface HeaderSectionProps {
  context: "create" | "edit";
  onSaveComplete: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function HeaderSection({
  context,
  onSubmit,
  isSubmitting,
}: HeaderSectionProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/products/list"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-pop">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {context === "edit" ? "Editar producto" : "Nuevo producto"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Completá la información de tu producto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/products/list">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button variant="gradient" onClick={onSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {context === "edit" ? "Guardar cambios" : "Crear producto"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
