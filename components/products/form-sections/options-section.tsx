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
      <CardHeader className="flex flex-row items-center gap-2">
        <Settings className="h-10 w-10" />
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Este producto tiene envío gratis</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="showInStore"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mostrar en la tienda</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Publicado</FormLabel>
                <FormDescription>Este producto será visible en tu tienda</FormDescription>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
