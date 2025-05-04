"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import {
  selectClientFilters,
  setClientProvince,
  setClientRegistrationDateRange,
  resetClientFilters,
} from "@/store/slices/clientFiltersSlice"

export function UserFilters() {
  const dispatch = useDispatch()
  const currentFilters = useSelector(selectClientFilters)

  const [localDateFrom, setLocalDateFrom] = useState(() => currentFilters.registrationDateFrom || "")
  const [localDateTo, setLocalDateTo] = useState(() => currentFilters.registrationDateTo || "")

  useEffect(() => {
    setLocalDateFrom(currentFilters.registrationDateFrom || "")
    setLocalDateTo(currentFilters.registrationDateTo || "")
  }, [currentFilters.registrationDateFrom, currentFilters.registrationDateTo])

  const handleProvinceChange = (value: string) => {
    dispatch(setClientProvince(value === "todos" ? null : value))
  }

  const handleDateChange = (field: "from" | "to", value: string) => {
    if (field === "from") {
      setLocalDateFrom(value)
    } else {
      setLocalDateTo(value)
    }
  }

  const handleApplyDateRange = () => {
    dispatch(setClientRegistrationDateRange({ 
      from: localDateFrom || null, 
      to: localDateTo || null 
    }))
  }

  const handleReset = () => {
    dispatch(resetClientFilters())
  }

  const selectedProvince = currentFilters.province || "todos"

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estado">Provincia/Estado</Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger id="estado">
              <SelectValue placeholder="Todas las provincias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las provincias</SelectItem>
              <SelectItem value="buenos aires">Buenos Aires</SelectItem>
              <SelectItem value="catamarca">Catamarca</SelectItem>
              <SelectItem value="chaco">Chaco</SelectItem>
              <SelectItem value="chubut">Chubut</SelectItem>
              <SelectItem value="caba">CABA</SelectItem>
              <SelectItem value="cordoba">Córdoba</SelectItem>
              <SelectItem value="corrientes">Corrientes</SelectItem>
              <SelectItem value="entre rios">Entre Ríos</SelectItem>
              <SelectItem value="formosa">Formosa</SelectItem>
              <SelectItem value="jujuy">Jujuy</SelectItem>
              <SelectItem value="la pampa">La Pampa</SelectItem>
              <SelectItem value="la rioja">La Rioja</SelectItem>
              <SelectItem value="mendoza">Mendoza</SelectItem>
              <SelectItem value="misiones">Misiones</SelectItem>
              <SelectItem value="neuquen">Neuquén</SelectItem>
              <SelectItem value="rio negro">Río Negro</SelectItem>
              <SelectItem value="salta">Salta</SelectItem>
              <SelectItem value="san juan">San Juan</SelectItem>
              <SelectItem value="san luis">San Luis</SelectItem>
              <SelectItem value="santa cruz">Santa Cruz</SelectItem>
              <SelectItem value="santa fe">Santa Fe</SelectItem>
              <SelectItem value="santiago del estero">Santiago del Estero</SelectItem>
              <SelectItem value="tierra del fuego">Tierra del Fuego</SelectItem>
              <SelectItem value="tucuman">Tucumán</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaDesde">Registrado Desde</Label>
          <Input
            id="fechaDesde"
            type="date"
            value={localDateFrom}
            onChange={(e) => handleDateChange("from", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaHasta">Registrado Hasta</Label>
          <Input
            id="fechaHasta"
            type="date"
            value={localDateTo}
            onChange={(e) => handleDateChange("to", e.target.value)}
            min={localDateFrom || undefined}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={handleReset}>
          Restablecer Todo
        </Button>
        <Button onClick={handleApplyDateRange}>Aplicar Fechas</Button>
      </div>
    </Card>
  )
}
