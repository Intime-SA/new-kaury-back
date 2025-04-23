import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Barcode } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Control } from "react-hook-form"

interface CodesSectionProps {
  control: Control<any>
}

export function CodesSection({ control }: CodesSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Barcode className="h-10 w-10" />
        <div>
          <CardTitle>Códigos</CardTitle>
          <CardDescription>Información para identificar tu producto</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="SKU" {...field} />
              </FormControl>
              <FormDescription>
                El SKU es un código que creás internamente para hacer un seguimiento de tus productos con variantes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de barras</FormLabel>
              <FormControl>
                <Input placeholder="Código de barras" {...field} />
              </FormControl>
              <FormDescription>
                El código de barras consta de 13 números y se utiliza para identificar un producto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
