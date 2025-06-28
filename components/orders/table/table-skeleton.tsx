import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  rows?: number
}

export function TableSkeleton({ rows = 10 }: TableSkeletonProps) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="h-[73px]">
          <TableCell className="w-[40px] p-4">
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell className="w-[120px] font-medium">
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className="w-[180px]">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="w-[180px] font-bold">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="w-[120px]">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell className="w-[150px]">
            <Skeleton className="h-[22px] w-20 rounded-full" />
          </TableCell>
          <TableCell className="w-[80px] text-right">
            <div className="flex justify-end">
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
} 