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
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell className="w-[180px]">
            <Skeleton className="h-4 w-[120px]" />
          </TableCell>
          <TableCell className="w-[180px] font-bold">
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell className="w-[120px]">
            <Skeleton className="h-[22px] w-[70px] rounded-full" />
          </TableCell>
          <TableCell className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </TableCell>
          <TableCell className="w-[100px]">
            <Skeleton className="h-[22px] w-[100px] rounded-full" />
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