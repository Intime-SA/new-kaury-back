import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  rows?: number
  compact?: boolean
}

export function TableSkeleton({ rows = 10, compact = false }: TableSkeletonProps) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRow key={`skeleton-${i}`} className={compact ? "h-[60px]" : "h-[73px]"}>
          <TableCell className={compact ? "w-[32px] p-2" : "w-[40px] p-4"}>
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell className={`font-medium ${compact ? "w-[80px]" : "w-[120px]"}`}>
            <Skeleton className={compact ? "h-4 w-12" : "h-4 w-16"} />
          </TableCell>
          <TableCell className="w-[60px] text-center">
            <Skeleton className="h-4 w-4 mx-auto" />
          </TableCell>
          <TableCell className={compact ? "w-[100px]" : "w-[180px]"}>
            <Skeleton className={compact ? "h-4 w-16" : "h-4 w-24"} />
          </TableCell>
          <TableCell className={`font-bold ${compact ? "w-[100px]" : "w-[180px]"}`}>
            <Skeleton className={compact ? "h-4 w-14" : "h-4 w-20"} />
          </TableCell>
          <TableCell className={compact ? "w-[80px]" : "w-[120px]"}>
            <Skeleton className={compact ? "h-5 w-12 rounded-full" : "h-5 w-16 rounded-full"} />
          </TableCell>
          <TableCell className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className={compact ? "h-4 w-24" : "h-4 w-32"} />
            </div>
          </TableCell>
          <TableCell className={compact ? "w-[100px]" : "w-[150px]"}>
            <Skeleton className={compact ? "h-[20px] w-16 rounded-full" : "h-[22px] w-20 rounded-full"} />
          </TableCell>
          <TableCell className={compact ? "w-[60px] text-right" : "w-[80px] text-right"}>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
} 