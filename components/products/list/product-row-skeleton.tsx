import { TableCell, TableRow } from "@/components/ui/table";

export function ProductRowSkeleton() {
  return (
    <TableRow>
      {/* Botón de expandir */}
      <TableCell className="w-4">
        <div className="w-4 h-4 rounded bg-muted animate-pulse mx-auto" />
      </TableCell>
      {/* Imagen */}
      <TableCell className="w-[100px]">
        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted animate-pulse mx-auto" />
      </TableCell>
      {/* Nombre */}
      <TableCell>
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </TableCell>
      {/* Precio */}
      <TableCell>
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      </TableCell>
      {/* Categoría */}
      <TableCell>
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </TableCell>
      {/* Visible */}
      <TableCell className="w-[100px]">
        <div className="w-8 h-4 bg-muted rounded animate-pulse mx-auto" />
      </TableCell>
      {/* Acciones */}
      <TableCell className="w-[100px]">
        <div className="flex gap-1 justify-center">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        </div>
      </TableCell>
    </TableRow>
  );
} 