import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  rows?: number
}

export function TableSkeleton({ rows = 10 }: TableSkeletonProps) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell className="w-[40px]">
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell className="w-[120px]">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="w-[180px]">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="w-[180px]">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="w-[120px]">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </TableCell>
          <TableCell className="w-[150px]">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="w-[80px]">
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
} 