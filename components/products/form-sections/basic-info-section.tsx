"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info, ShoppingBag, Edit, Wand2, Package, Cloud, Infinity, CircleDot, Video } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { Control } from "react-hook-form"

interface BasicInfoSectionProps {
  control: Control<any>
  generateDescription: () => void
}

export function BasicInfoSection({ control, generateDescription }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Info className="h-10 w-10" />
        <div>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>Información principal del producto</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="name.es"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <FormLabel>Nombre</FormLabel>
              </div>
              <FormControl>
                <Input placeholder="Ej: Campera de cuero" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description.es"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <FormLabel>Descripción</FormLabel>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    Próximamente
                  </Badge>
                  <Button type="button" variant="outline" size="sm" onClick={generateDescription} disabled>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generar con IA
                  </Button>
                </div>
              </div>
              <FormControl>
                <Textarea placeholder="Describe tu producto..." className="min-h-[150px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="productType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue="physical"
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="physical" id="physical" />
                      <Label htmlFor="physical">Producto</Label>

                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="digital" id="digital" />
                      <Label htmlFor="digital">Digital / Servicios</Label>
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="stockManagement"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={field.value ? "true" : "false"}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="false" />
                      <Label htmlFor="false">Sin límite</Label>
                      <Infinity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="true" />
                      <Label htmlFor="true">Limitado</Label>
                      <CircleDot className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="urls.videoURL"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <FormLabel>Link externo (video)</FormLabel>
              </div>
              <FormControl>
                <Input placeholder="https://youtube.com/watch?v=..." {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>Pega un link de YouTube o de Vimeo sobre tu producto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
