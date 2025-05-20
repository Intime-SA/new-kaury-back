"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Filter,
  Loader2,
  Pencil,
  X,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { UserDetails } from "@/components/users/user-details";
import { UserFilters } from "@/components/users/user-filters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useClients } from "@/hooks/clients/useClients";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client } from "@/types/types.tsx";
import { useDispatch, useSelector } from "react-redux";
import { setClientSearchTerm, selectClientFilters, clearClientFilter, selectIsAnyClientFilterActive, resetClientFilters, ClientFiltersState } from "@/store/slices/clientFiltersSlice";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

export function UsersTable() {
  const dispatch = useDispatch();
  const clientFilters = useSelector(selectClientFilters);
  const isAnyFilterActive = useSelector(selectIsAnyClientFilterActive);

  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => clientFilters.searchTerm || "");
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    clients,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
    error,
  } = useClients();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (clientFilters.searchTerm || '')) {
        console.log("Dispatching debounced search term:", searchTerm || null);
        dispatch(setClientSearchTerm(searchTerm || null));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, clientFilters.searchTerm]);

  useEffect(() => {
    setSearchTerm(clientFilters.searchTerm || '');
  }, [clientFilters.searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const toggleExpand = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const handleClearFilter = (filterType: Parameters<typeof clearClientFilter>[0]) => {
    dispatch(clearClientFilter(filterType));
    if (filterType === 'searchTerm') {
      setSearchTerm('');
    }
  };

  const renderFilterChips = () => {
    const chips = [];

    if (clientFilters.searchTerm) {
      chips.push(
        <Badge key="searchTerm" variant="secondary" className="flex items-center gap-1">
          <Search className="h-3 w-3" />
          {clientFilters.searchTerm}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("searchTerm")} />
        </Badge>
      );
    }
    
    if (clientFilters.province) {
      chips.push(
        <Badge key="province" variant="secondary" className="flex items-center gap-1 capitalize">
          <MapPin className="h-3 w-3" />
          {clientFilters.province}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("province")} />
        </Badge>
      );
    }

    if (clientFilters.registrationDateFrom || clientFilters.registrationDateTo) {
      const formattedFrom = clientFilters.registrationDateFrom ? formatDate(clientFilters.registrationDateFrom + 'T00:00:00') : '';
      const formattedTo = clientFilters.registrationDateTo ? formatDate(clientFilters.registrationDateTo + 'T00:00:00') : '';
      chips.push(
        <Badge key="registrationDate" variant="secondary" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Registro:
          {formattedFrom ? ` Desde ${formattedFrom}` : ""}
          {formattedFrom && formattedTo ? " - " : ""}
          {formattedTo ? ` Hasta ${formattedTo}` : ""}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleClearFilter("registrationDate")} />
        </Badge>
      );
    }

    return chips;
  };

  const handleExport = async () => {
    setIsExporting(true);
    const exportParams = new URLSearchParams();
    
    Object.entries(clientFilters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        const paramKey = key === 'searchTerm' ? 'search' : key;
        exportParams.set(paramKey, String(value));
      }
    });

    const exportDataUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/export?${exportParams.toString()}`;
    console.log("Fetching data for export from URL:", exportDataUrl);

    try {
      const response = await fetch(exportDataUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Error ${response.status} al obtener datos para exportar`);
      }

      const apiResponse = await response.json();

      if (!apiResponse || !Array.isArray(apiResponse.data)) {
        console.error("Respuesta inesperada de la API de exportación:", apiResponse);
        throw new Error("El formato de datos recibido para exportar no es válido.");
      }

      const dataToExport = apiResponse.data;

      if (dataToExport.length === 0) {
        toast({ title: "Exportación Vacía", description: "No se encontraron clientes con los filtros aplicados.", variant: "default" });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

      const fileName = `clientes_exportados_${new Date().toISOString().split('T')[0]}.xlsx`; 
      XLSX.writeFile(workbook, fileName);

      toast({ title: "Exportación Exitosa", description: `Se ha descargado el archivo ${fileName}` });

    } catch (error) {
      console.error('Error exporting clients:', error);
      toast({ title: "Error de Exportación", description: (error as Error).message || "No se pudo generar el archivo.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (status === "error") {
    return (
      <Card className="p-6 text-center text-destructive">
        Error al cargar los clientes:{" "}
        {(error as Error)?.message || "Error desconocido"}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido, email, provincia, dni..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="default" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exportando...</>
            ) : (
              'Exportar'
            )}
          </Button>
        </div>
      </div>

      {!showFilters && isAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium mr-1">Filtros activos:</span>
          {renderFilterChips()}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive" 
            onClick={() => dispatch(resetClientFilters())}
          >
            Limpiar todos
          </Button>
        </div>
      )}

      {showFilters && <UserFilters />}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-[180px]">Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Acciones</TableHead>
              <TableHead>Fecha Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skel-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client: Client) => (
                <>
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleExpand(client.id)}
                  >
                    <TableCell>
                      {expandedUser === client.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {client.name} {client.apellido}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>

                    <TableCell>
                      {client.fechaInicio
                        ? formatDate(client.fechaInicio)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-start gap-1">
                        {client.telefono &&
                          (() => {
                            const cleanedNumber = client.telefono.replace(
                              /\D/g,
                              ""
                            );
                            const whatsappUrl = `https://wa.me/${cleanedNumber}`;
                            return (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                                title="Contactar por WhatsApp"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            );
                          })()}
                        <Link
                          href={`/clients/edit/${client.id}`}
                          passHref
                          legacyBehavior
                        >
                          <a
                            onClick={(e) => e.stopPropagation()}
                            title="Editar Cliente"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </a>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedUser === client.id && (
                    <TableRow className="bg-muted/20 hover:bg-muted/30">
                      <TableCell colSpan={5} className="p-4">
                        {client.datosEnvio ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="font-medium text-muted-foreground col-span-full mb-1">
                              Datos de Envío:
                            </div>
                            <p>
                              <span className="font-semibold">Nombre:</span>{" "}
                              {client.datosEnvio.name || "-"}{" "}
                              {client.datosEnvio.apellido || "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Email:</span>{" "}
                              {client.datosEnvio.email || "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Teléfono:</span>{" "}
                              {client.datosEnvio.telefono || "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Dirección:</span>{" "}
                              {`${client.datosEnvio.calle || ""} ${
                                client.datosEnvio.numero || ""
                              }${
                                client.datosEnvio.pisoDpto
                                  ? ", " + client.datosEnvio.pisoDpto
                                  : ""
                              }`.trim() || "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Barrio:</span>{" "}
                              {client.datosEnvio.barrio || "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Ciudad:</span>{" "}
                              {client.datosEnvio.ciudad || "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Provincia/Estado:
                              </span>{" "}
                              {client.datosEnvio.provincia ||
                                client.datosEnvio.estado ||
                                "-"}
                            </p>
                            <p>
                              <span className="font-semibold">C.P.:</span>{" "}
                              {typeof client.datosEnvio.codigoPostal ===
                              "boolean"
                                ? "N/A"
                                : client.datosEnvio.codigoPostal || "-"}
                            </p>

                            <div className="font-medium text-muted-foreground col-span-full mt-2 mb-1">
                              Otros Datos:
                            </div>
                            <p>
                              <span className="font-semibold">DNI:</span>{" "}
                              {client.dni || "-"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No hay datos de envío disponibles.
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
            {isFetchingNextPage && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />{" "}
                  Cargando más clientes...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div ref={loadMoreRef} style={{ height: "10px" }} />

      {!isLoading && !hasNextPage && clients.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          Has llegado al final.
        </div>
      )}
    </Card>
  );
}
