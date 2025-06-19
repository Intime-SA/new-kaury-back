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
          <TableCell className="w-[5%] p-4">
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell className="w-[14%] font-medium">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="w-[14%]">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="w-[14%] font-bold">
            <Skeleton className="h-4 w-full" />
          </TableCell>
          <TableCell className="w-[10%]">
            <Skeleton className="h-auto w-full rounded-full" />
          </TableCell>
          <TableCell className="flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          </TableCell>
          <TableCell className="w-[10%]">
            <Skeleton className="h-[22px] w-full rounded-full" />
          </TableCell>
          <TableCell className="w-[5%] text-right">
            <div className="flex justify-end">
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
} 