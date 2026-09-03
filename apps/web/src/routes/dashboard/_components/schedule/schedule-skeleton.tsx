import { Skeleton } from '@rozumari/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@rozumari/ui/components/table'

export const ScheduleSkeleton = () => (
  <>
    {/* ==================== MOBILE SKELETON ==================== */}
    <section className='flex flex-col md:hidden'>
      <div className='sticky inset-16 z-40 -mx-4 grid grid-cols-7 gap-2 bg-background p-4 shadow-sm'>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className='flex aspect-square flex-col items-center justify-center gap-1 rounded-md bg-card ring-1 ring-foreground/10'
          >
            <Skeleton className='h-3 w-6' />
            <Skeleton className='h-4 w-4 rounded-full' />
          </div>
        ))}
      </div>

      <div className='mt-2 space-y-6'>
        {Array.from({ length: 2 }).map((_, groupIdx) => (
          <div key={groupIdx} className='space-y-3'>
            {/* Date Header Badge Skeleton */}
            <div className='flex items-center gap-2'>
              <div className='h-px w-4 bg-border' />
              <Skeleton className='h-7 w-28 rounded-md' />
            </div>

            {/* Card List Skeleton */}
            <ul className='grid gap-3'>
              {Array.from({ length: 2 }).map((__, cardIdx) => (
                <li
                  key={cardIdx}
                  className='flex flex-col gap-4 overflow-hidden rounded-xl border-l-2 border-l-muted bg-card p-4 ring-1 ring-foreground/10'
                >
                  {/* CardHeader */}
                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='flex items-center gap-1.5'>
                      <Skeleton className='size-4 rounded-full' />
                      <Skeleton className='h-5 w-16' />
                    </div>
                    <Skeleton className='h-5 w-24 rounded-md' />
                  </div>

                  <div className='mx-4 space-y-2 rounded-lg bg-muted/40 p-3'>
                    <div className='flex items-center justify-between gap-4 py-1'>
                      <div className='flex items-center gap-2'>
                        <Skeleton className='size-4 rounded-full' />
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-3 w-12' />
                      </div>
                      <Skeleton className='h-5 w-28 rounded-md' />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    {/* ==================== DESKTOP SKELETON ==================== */}
    <section className='mt-4 hidden w-full max-w-full min-w-0 overflow-x-auto rounded-md border bg-card md:block'>
      <Table className='table-fixed border-collapse'>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent [&>th]:w-80 [&>th]:border-r [&>th]:p-4 [&>th]:first:w-32 [&>th]:last:border-r-0'>
            <TableHead className='text-center'>
              <Skeleton className='mx-auto h-4 w-20' />
            </TableHead>
            {Array.from({ length: 7 }).map((_, i) => (
              <TableHead key={i}>
                <div className='flex flex-col items-center gap-1'>
                  <Skeleton className='h-3 w-8' />
                  <Skeleton className='h-4 w-6' />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className='h-48 hover:bg-transparent'>
              <TableCell className='border-r border-border bg-muted/50 p-3 text-center'>
                <div className='flex flex-col items-center justify-center gap-1.5'>
                  <Skeleton className='size-6 rounded-full' />
                  <Skeleton className='h-5 w-16' />
                  <Skeleton className='h-3 w-20' />
                </div>
              </TableCell>

              {Array.from({ length: 7 }).map((__, colIndex) => (
                <TableCell
                  key={colIndex}
                  className='border-r border-border p-2.5 align-top last:border-r-0'
                >
                  {(rowIndex + colIndex) % 2 === 0 && (
                    <div className='space-y-3 rounded-xl border-l-2 border-l-muted bg-card p-3 ring-1 ring-foreground/10'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <div className='flex items-center gap-1.5'>
                          <Skeleton className='size-4 rounded-full' />
                          <Skeleton className='h-4 w-12' />
                        </div>
                        <Skeleton className='h-5 w-20 rounded-md' />
                      </div>

                      <div className='mx-2 space-y-2 rounded-lg bg-muted/40 p-2'>
                        <div className='flex items-center justify-between gap-2 text-xs'>
                          <div className='flex items-center gap-1.5'>
                            <Skeleton className='size-3.5 rounded-full' />
                            <Skeleton className='h-3 w-16' />
                          </div>
                          <Skeleton className='h-4 w-20 rounded-md' />
                        </div>
                      </div>
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  </>
)
