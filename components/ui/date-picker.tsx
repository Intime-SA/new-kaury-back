"use client"

import * as React from "react"
import { format, isValid, parseISO } from "date-fns"
import { es } from "date-fns/locale" // Importar locale en español
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: string | null | undefined; // Acepta ISO string YYYY-MM-DD
  onSelect: (date: string | null) => void; // Devuelve ISO string o null
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ value, onSelect, placeholder = "Selecciona fecha", disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convierte el ISO string a objeto Date solo si es válido
  const selectedDate = React.useMemo(() => {
      if (!value) return undefined;
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : undefined;
  }, [value]);


  const handleSelect = (date: Date | undefined) => {
      if (date) {
        onSelect(format(date, 'yyyy-MM-dd')); // Formato ISO YYYY-MM-DD
      }
      setOpen(false); // Cerrar popover al seleccionar
  }

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation(); // Evitar que el click abra el popover
      onSelect(null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>{placeholder}</span>}
           {/* Botón para limpiar */}
           {value && (
             <X
               className="ml-auto h-4 w-4 text-muted-foreground hover:text-foreground"
               onClick={handleClear}
             />
           )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          locale={es} // Usar locale español
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
} 