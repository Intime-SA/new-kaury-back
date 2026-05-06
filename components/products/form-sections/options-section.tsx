import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import type { Control } from "react-hook-form"

interface OptionsSectionProps {
  control: Control<any>
}

export function OptionsSection({ control }: OptionsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary">
          <Settings className="h-5 w-5" />
        </span>
        <div>
          <CardTitle>Más opciones</CardTitle>
          <CardDescription>Configuraciones adicionales del producto</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="freeShipping"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Este producto tiene envío gratis</FormLabel>
                <FormDescription>
                  Al activar esta opción, el envío será gratuito para este producto
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="showInStore"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mostrar en la tienda</FormLabel>
                <FormDescription>
                  Si está desactivado, el producto no será visible para los clientes
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Producto destacado</FormLabel>
                <FormDescription>
                  Los productos destacados aparecerán en la página principal
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
