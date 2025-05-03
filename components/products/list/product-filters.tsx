"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import {
  type ProductFiltersState,
  selectProductFilters,
  setPriceRange,
  setStockStatus,
  setCreationDateRange,
  setUpdateDateRange,
  resetFilters,
  clearFilter,
  setProductName,
  selectIsAnyFilterActive,
} from "@/store/slices/productFiltersSlice"
import { Search, Filter, DollarSign, Package2, Calendar, RefreshCw, X, ChevronDown } from "lucide-react"

export function ProductFilters() {
  const dispatch = useDispatch()
  const filters = useSelector(selectProductFilters)
  const hasFilters = useSelector(selectIsAnyFilterActive)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // --- Estado Local para filtros temporales ---
  const [localProductName, setLocalProductName] = useState(() => filters.productName || '')
  const [localMinPrice, setLocalMinPrice] = useState<string | null>(null)
  const [localMaxPrice, setLocalMaxPrice] = useState<string | null>(null)
  const [localCreatedAtFrom, setLocalCreatedAtFrom] = useState<string | null>(null)
  const [localCreatedAtTo, setLocalCreatedAtTo] = useState<string | null>(null)
  const [localUpdatedAtFrom, setLocalUpdatedAtFrom] = useState<string | null>(null)
  const [localUpdatedAtTo, setLocalUpdatedAtTo] = useState<string | null>(null)

  // --- Sincronizar estado local con Redux al abrir un filtro ---
  useEffect(() => {
    if (activeFilter === 'price') {
        setLocalMinPrice(filters.minPrice?.toString() ?? '');
        setLocalMaxPrice(filters.maxPrice?.toString() ?? '');
    } else if (activeFilter === 'createdAt') {
        setLocalCreatedAtFrom(filters.createdAtFrom ?? null);
        setLocalCreatedAtTo(filters.createdAtTo ?? null);
    } else if (activeFilter === 'updatedAt') {
        setLocalUpdatedAtFrom(filters.updatedAtFrom ?? null);
        setLocalUpdatedAtTo(filters.updatedAtTo ?? null);
    }
    if (!filterMenuOpen || activeFilter === 'productName') {
         setLocalProductName(filters.productName || '');
    }
  }, [activeFilter, filters, filterMenuOpen]);

  // --- Debounce para la búsqueda por nombre ---
  useEffect(() => {
    const timer = setTimeout(() => {
        if (localProductName !== (filters.productName || '')) {
            console.log("Debounce dispatch productName:", localProductName || null)
            dispatch(setProductName(localProductName || null));
        }
    }, 500);

    return () => clearTimeout(timer);

  }, [localProductName, dispatch, filters.productName]);

  // --- Handlers que actualizan ESTADO LOCAL ---
  const handleLocalPriceChange = (field: "min" | "max", value: string) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        if (field === 'min') setLocalMinPrice(value);
        else setLocalMaxPrice(value);
    }
  }

  const handleLocalCreationDateChange = (field: "from" | "to", date: string | null) => {
     if (field === 'from') setLocalCreatedAtFrom(date);
     else setLocalCreatedAtTo(date);
  }

  const handleLocalUpdateDateChange = (field: "from" | "to", date: string | null) => {
     if (field === 'from') setLocalUpdatedAtFrom(date);
     else setLocalUpdatedAtTo(date);
  }

  const handleLocalProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProductName(e.target.value);
  }

  // --- Handlers que aplican filtros (despachan a Redux) ---
  const handleApplyPriceFilter = () => {
    const min = localMinPrice === '' || localMinPrice === null ? null : Number(localMinPrice);
    const max = localMaxPrice === '' || localMaxPrice === null ? null : Number(localMaxPrice);
    if ((min === null || !isNaN(min)) && (max === null || !isNaN(max))) {
        dispatch(setPriceRange({ min, max }));
        setActiveFilter(null);
        setFilterMenuOpen(false);
    } else {
        console.error("Precio inválido introducido");
    }
  }
  
  const handleApplyCreationDateFilter = () => {
    dispatch(setCreationDateRange({ from: localCreatedAtFrom, to: localCreatedAtTo }));
    setActiveFilter(null);
    setFilterMenuOpen(false);
  }

  const handleApplyUpdateDateFilter = () => {
    dispatch(setUpdateDateRange({ from: localUpdatedAtFrom, to: localUpdatedAtTo }));
    setActiveFilter(null);
    setFilterMenuOpen(false);
  }

  // --- Handlers que siguen siendo instantáneos ---
  const handleStockChange = (value: string) => {
    let stockStatus: boolean | null = null
    if (value === "true") stockStatus = true
    if (value === "false") stockStatus = false
    dispatch(setStockStatus(stockStatus))
    setFilterMenuOpen(false);
  }

   const handleProductNameChange = (value: string) => {
    dispatch(setProductName(value || null))
  }

  // --- Limpiar filtros ---
   const handleResetFilters = () => {
    dispatch(resetFilters());
    setLocalProductName('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalCreatedAtFrom(null);
    setLocalCreatedAtTo(null);
    setLocalUpdatedAtFrom(null);
    setLocalUpdatedAtTo(null);
    setActiveFilter(null);
    setFilterMenuOpen(false);
  }

   type FilterTypeToClear = keyof ProductFiltersState | 'price' | 'creationDate' | 'updateDate' | 'productName';

   const handleClearFilter = (filterType: FilterTypeToClear) => {
    if (filterType === 'productName') {
      dispatch(setProductName(null));
      setLocalProductName('');
    } else {
      dispatch(clearFilter(filterType as Exclude<FilterTypeToClear, 'productName'>));
      if(filterType === 'price') { setLocalMinPrice(''); setLocalMaxPrice(''); }
      if(filterType === 'creationDate') { setLocalCreatedAtFrom(null); setLocalCreatedAtTo(null); }
      if(filterType === 'updateDate') { setLocalUpdatedAtFrom(null); setLocalUpdatedAtTo(null); }
    }
    if ((filterType === 'price' && activeFilter === 'price') ||
         (filterType === 'creationDate' && activeFilter === 'createdAt') ||
         (filterType === 'updateDate' && activeFilter === 'updatedAt')) {
        setActiveFilter(null);
     }
  }

  // --- Selección de filtro activo ---
  const handleSelectFilter = (filterType: string) => {
    setActiveFilter(activeFilter === filterType ? null : filterType)
  }


  // Mapeo del valor de stock para el Select (sin cambios)
  const stockValue = filters.inStock === true ? "true" : filters.inStock === false ? "false" : "all"

  // Renderizar chips para filtros aplicados (sin cambios)
  const renderFilterChips = () => {
      const chips = []

    if (filters.productName) {
      chips.push(
        <Badge key="name" variant="secondary" className="flex items-center gap-1 mr-2 mb-2">
          <Search className="h-3 w-3" />
          {filters.productName}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("productName")} />
        </Badge>,
      )
    }

    if (filters.minPrice !== null || filters.maxPrice !== null) {
      chips.push(
        <Badge key="price" variant="secondary" className="flex items-center gap-1 mr-2 mb-2">
          <DollarSign className="h-3 w-3" />
          {filters.minPrice !== null ? `Desde $${filters.minPrice}` : ""}
          {filters.minPrice !== null && filters.maxPrice !== null ? " - " : ""}
          {filters.maxPrice !== null ? `Hasta $${filters.maxPrice}` : ""}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("price")} />
        </Badge>,
      )
    }

    if (filters.inStock !== null) {
      chips.push(
        <Badge key="stock" variant="secondary" className="flex items-center gap-1 mr-2 mb-2">
          <Package2 className="h-3 w-3" />
          {filters.inStock ? "Con Stock" : "Sin Stock"}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("inStock")} />
        </Badge>,
      )
    }

    if (filters.createdAtFrom !== null || filters.createdAtTo !== null) {
       const formattedFrom = filters.createdAtFrom ? new Date(filters.createdAtFrom + 'T00:00:00').toLocaleDateString('es-AR') : '';
      const formattedTo = filters.createdAtTo ? new Date(filters.createdAtTo + 'T00:00:00').toLocaleDateString('es-AR') : '';
      chips.push(
        <Badge key="created" variant="secondary" className="flex items-center gap-1 mr-2 mb-2">
          <Calendar className="h-3 w-3" />
          Creado:
          {formattedFrom ? ` Desde ${formattedFrom}` : ""}
          {formattedFrom && formattedTo ? " - " : ""}
          {formattedTo ? ` Hasta ${formattedTo}` : ""}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("creationDate")} />
        </Badge>,
      )
    }

    if (filters.updatedAtFrom !== null || filters.updatedAtTo !== null) {
      const formattedFrom = filters.updatedAtFrom ? new Date(filters.updatedAtFrom + 'T00:00:00').toLocaleDateString('es-AR') : '';
      const formattedTo = filters.updatedAtTo ? new Date(filters.updatedAtTo + 'T00:00:00').toLocaleDateString('es-AR') : '';
      chips.push(
        <Badge key="updated" variant="secondary" className="flex items-center gap-1 mr-2 mb-2">
          <RefreshCw className="h-3 w-3" />
          Actualizado:
          {formattedFrom ? ` Desde ${formattedFrom}` : ""}
          {formattedFrom && formattedTo ? " - " : ""}
          {formattedTo ? ` Hasta ${formattedTo}` : ""}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("updateDate")} />
        </Badge>,
      )
    }

    return chips
  }


  return (
    <div className="mb-6 space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-9"
            value={localProductName}
            onChange={handleLocalProductNameChange}
          />
        </div>

        <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {hasFilters && <span className="ml-1 h-2 w-2 rounded-full bg-sky-500"></span>}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem onSelect={() => handleSelectFilter("price")} className="cursor-pointer">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Precio</span>
                  </CommandItem>
                  {activeFilter === "price" && (
                    <div className="px-4 py-2 grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="minPricePopover">Mínimo</Label>
                        <Input
                          id="minPricePopover"
                          type="text"
                          inputMode="decimal"
                          placeholder="Desde $"
                          value={localMinPrice ?? ''}
                          onChange={(e) => handleLocalPriceChange("min", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPricePopover">Máximo</Label>
                        <Input
                          id="maxPricePopover"
                          type="text"
                          inputMode="decimal"
                          placeholder="Hasta $"
                          value={localMaxPrice ?? ''}
                          onChange={(e) => handleLocalPriceChange("max", e.target.value)}
                        />
                      </div>
                      <Button className="col-span-2 mt-2" onClick={handleApplyPriceFilter}>
                        Aplicar
                      </Button>
                    </div>
                  )}

                  <CommandItem onSelect={() => handleSelectFilter("stock")} className="cursor-pointer">
                    <Package2 className="mr-2 h-4 w-4" />
                    <span>Stock</span>
                  </CommandItem>
                  {activeFilter === "stock" && (
                    <div className="px-4 py-2">
                      <Select value={stockValue} onValueChange={handleStockChange}>
                        <SelectTrigger id="stockStatusPopover">
                          <SelectValue placeholder="Seleccionar stock..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="true">Con Stock</SelectItem>
                          <SelectItem value="false">Sin Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <CommandItem onSelect={() => handleSelectFilter("createdAt")} className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Fecha de Creación</span>
                  </CommandItem>
                  {activeFilter === "createdAt" && (
                    <div className="px-4 py-2 grid grid-cols-1 gap-2">
                      <div>
                        <Label>Desde</Label>
                        <DatePicker
                          value={localCreatedAtFrom}
                          onSelect={(date) => handleLocalCreationDateChange("from", date)}
                          placeholder="Desde fecha"
                        />
                      </div>
                      <div>
                        <Label>Hasta</Label>
                        <DatePicker
                          value={localCreatedAtTo}
                          onSelect={(date) => handleLocalCreationDateChange("to", date)}
                          placeholder="Hasta fecha"
                        />
                      </div>
                      <Button className="mt-2" onClick={handleApplyCreationDateFilter}>
                        Aplicar
                      </Button>
                    </div>
                  )}

                  <CommandItem onSelect={() => handleSelectFilter("updatedAt")} className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Fecha de Actualización</span>
                  </CommandItem>
                  {activeFilter === "updatedAt" && (
                    <div className="px-4 py-2 grid grid-cols-1 gap-2">
                      <div>
                        <Label>Desde</Label>
                        <DatePicker
                          value={localUpdatedAtFrom}
                          onSelect={(date) => handleLocalUpdateDateChange("from", date)}
                          placeholder="Desde fecha"
                        />
                      </div>
                      <div>
                        <Label>Hasta</Label>
                        <DatePicker
                          value={localUpdatedAtTo}
                          onSelect={(date) => handleLocalUpdateDateChange("to", date)}
                          placeholder="Hasta fecha"
                        />
                      </div>
                      <Button className="mt-2" onClick={handleApplyUpdateDateFilter}>
                        Aplicar
                      </Button>
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
              {hasFilters && (
                 <div className="p-2 border-t">
                   <Button variant="ghost" className="w-full justify-center" onClick={handleResetFilters}>
                     Limpiar Todos los Filtros
                   </Button>
                 </div>
               )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-y-2">
          {renderFilterChips()}
           {renderFilterChips().length > 0 && (
             <Button variant="ghost" size="sm" className="h-7 px-2 text-xs ml-2" onClick={handleResetFilters}>
              Limpiar todos
             </Button>
           )}
        </div>
      )}
    </div>
  )
}
