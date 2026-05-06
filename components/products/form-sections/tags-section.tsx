"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Star, Wand2, Edit } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TagsInput } from "@/components/products/tags-input"
import type { Control } from "react-hook-form"

interface TagsSectionProps {
  control: Control<any>
}

export function TagsSection({ control }: TagsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-soft">
          <Star className="h-5 w-5" />
        </span>
        <div className="w-full">
          <CardTitle className="flex justify-between items-center gap-2">
            Tags, Marca y SEO
            <div className="inline-flex items-center gap-2 text-xs font-normal text-primary">
              <Wand2 className="h-3 w-3" />
              Generar con IA
              <Badge variant="soft" className="text-[10px]">Próximamente</Badge>
            </div>
          </CardTitle>
          <CardDescription>Creá palabras clave y facilitá la búsqueda</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TagsInput value={field.value || []} onChange={field.onChange} />
              </FormControl>
              <FormDescription>Agrega etiquetas para mejorar la búsqueda de tu producto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
