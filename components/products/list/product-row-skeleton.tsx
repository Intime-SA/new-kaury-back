import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductRowSkeleton() {
  return (
    <TableRow>
      {/* Celda para botón de expandir (vacía o skeleton pequeño) */}
      <TableCell className="w-4">
        <Skeleton className="h-4 w-4" />
      </TableCell>
      {/* Celda de Imagen */}
      <TableCell className="w-[100px]">
        <Skeleton className="h-16 w-16 rounded-md" />
      </TableCell>
      {/* Celda de Nombre */}
      <TableCell>
        <Skeleton className="h-4 w-[250px]" />
      </TableCell>
      {/* Celda de Precio */}
      <TableCell>
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
      {/* Celda de Categoría */}
      <TableCell>
        <Skeleton className="h-6 w-[150px] rounded-md" />
      </TableCell>
      {/* Celda de Visible */}
      <TableCell className="w-[100px]">
        <Skeleton className="h-5 w-5 rounded-full" />
      </TableCell>
      {/* Celda de Acciones */}
      <TableCell className="w-[100px]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  );
} 