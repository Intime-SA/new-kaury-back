import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductRowSkeleton } from "./product-row-skeleton"; // Importar el skeleton de fila

interface ProductTableSkeletonProps {
  rows?: number; // Número opcional de filas a mostrar
}

export function ProductTableSkeleton({ rows = 5 }: ProductTableSkeletonProps) {
  return (
    <ScrollArea className="rounded-md border">
      <Table>
        <TableHeader>
          {/* Usar los encabezados reales de la tabla */}
          <TableRow>
            <TableHead className="w-4"></TableHead>
            <TableHead className="w-[100px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="w-[100px]">Visible</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Renderizar el número especificado de filas skeleton */}
          {Array.from({ length: rows }).map((_, index) => (
            <ProductRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
} 