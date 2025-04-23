"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Weight, ExternalLink } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Control } from "react-hook-form"

interface DimensionsSectionProps {
  control: Control<any>
  handleDimensionChange: (field: "weight" | "depth" | "width" | "height", value: string) => void
}

export function DimensionsSection({ control, handleDimensionChange }: DimensionsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Weight className="h-10 w-10" />
        <div>
          <CardTitle>Peso y dimensiones</CardTitle>
          <CardDescription>Ingresá los datos para calcular el costo de envío</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={control}
            name="dimensions.weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input
                      placeholder="0.14"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleDimensionChange("weight", e.target.value)
                      }}
                    />
                  </FormControl>
                  <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                    kg
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dimensions.depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profundidad</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input
                      placeholder="30"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleDimensionChange("depth", e.target.value)
                      }}
                    />
                  </FormControl>
                  <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                    cm
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dimensions.width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancho</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input
                      placeholder="30"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleDimensionChange("width", e.target.value)
                      }}
                    />
                  </FormControl>
                  <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                    cm
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dimensions.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alto</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input
                      placeholder="30"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleDimensionChange("height", e.target.value)
                      }}
                    />
                  </FormControl>
                  <div className="flex items-center justify-center bg-muted border border-l-0 rounded-r-md px-3">
                    cm
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4">
          <Button variant="link" className="p-0 h-auto text-blue-600 flex items-center">
            <span>Más sobre calcular el peso y las dimensiones</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
