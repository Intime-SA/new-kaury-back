"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Instagram, ExternalLink } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Control } from "react-hook-form"

interface SocialSectionProps {
  control: Control<any>
}

export function SocialSection({ control }: SocialSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex gap-1">
          <Instagram className="h-10 w-10" />
        </div>
        <div className="w-full">
          <CardTitle className="flex justify-between items-center gap-2">
            Instagram y Google Shopping
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              Próximamente
            </Badge>
          </CardTitle>
          <CardDescription>
            Destacá tus productos en las vidrieras virtuales de Instagram y Google gratuitamente.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="opacity-50 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="mpn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MPN</FormLabel>
                <FormControl>
                  <Input placeholder="MPN" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="ageRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rango de edad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná el rango de edad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="adult">Adulto</SelectItem>
                    <SelectItem value="teen">Adolescente</SelectItem>
                    <SelectItem value="child">Niño</SelectItem>
                    <SelectItem value="infant">Bebé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná el sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4">
          <Button variant="link" className="p-0 h-auto text-blue-600 flex items-center" disabled>
            <span>¿Cómo completar estos datos?</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
