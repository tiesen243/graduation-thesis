import { Card, CardContent, CardHeader } from '@rozumari/ui/components/card'
import { Skeleton } from '@rozumari/ui/components/skeleton'

export function DevicesShowPageSkeleton() {
  return (
    <>
      <span className='sr-only'>Loading device details...</span>

      {/* DeviceInfo Skeleton */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div className='space-y-2'>
            <Skeleton className='w-48 text-2xl font-bold'>&nbsp;</Skeleton>
            <Skeleton className='w-32 text-sm text-muted-foreground'>
              &nbsp;
            </Skeleton>
          </div>
          <Skeleton className='h-6 w-20 rounded-full' />
        </CardHeader>
        <CardContent>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='space-y-1'>
                <Skeleton className='w-20 text-xs text-muted-foreground'>
                  &nbsp;
                </Skeleton>
                <Skeleton className='w-28 text-sm font-medium'>&nbsp;</Skeleton>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs & Content Skeleton */}
      <div className='mt-7'>
        {/* TabsList Skeleton */}
        <div className='flex h-10 w-fit items-center rounded-lg bg-muted p-1'>
          <Skeleton className='h-8 w-24 rounded-md' />
          <Skeleton className='h-8 w-28 rounded-md' />
          <Skeleton className='h-8 w-24 rounded-md' />
        </div>

        {/* Overview Tab Content Skeleton */}
        <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className='px-4 py-4'>
              <div className='flex items-center gap-3'>
                <Skeleton className='size-10 shrink-0 rounded-lg' />
                <div className='flex flex-col gap-1'>
                  <Skeleton className='w-24 text-xs font-medium text-muted-foreground'>
                    &nbsp;
                  </Skeleton>
                  <Skeleton className='w-16 text-lg font-semibold'>
                    &nbsp;
                  </Skeleton>
                  <Skeleton className='w-28 text-xs text-muted-foreground'>
                    &nbsp;
                  </Skeleton>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className='mt-4 grid gap-4 lg:grid-cols-[1fr_300px]'>
          {/* Left Section: Medication Compartments */}
          <section>
            <div className='mb-3 flex items-end justify-between'>
              <div className='space-y-1'>
                <Skeleton className='w-48 text-base font-semibold'>
                  &nbsp;
                </Skeleton>
                <Skeleton className='w-64 text-sm text-muted-foreground'>
                  &nbsp;
                </Skeleton>
              </div>
              <Skeleton className='hidden h-9 w-24 rounded-md sm:block' />
            </div>

            <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className='p-4'>
                  <div className='flex items-center justify-between pb-2'>
                    <Skeleton className='w-16 text-xs text-muted-foreground'>
                      &nbsp;
                    </Skeleton>
                    <Skeleton className='h-5 w-12 rounded-full' />
                  </div>
                  <div className='mt-2 space-y-2'>
                    <Skeleton className='w-28 text-sm font-medium'>
                      &nbsp;
                    </Skeleton>
                    <Skeleton className='w-20 text-xs text-muted-foreground'>
                      &nbsp;
                    </Skeleton>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Right Aside: Device Information & Alert */}
          <aside className='flex flex-col gap-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='w-32 text-sm font-medium'>&nbsp;</Skeleton>
                <Skeleton className='size-8 rounded-md' />
              </CardHeader>

              <CardContent>
                <dl className='divide-y text-sm'>
                  <div className='flex justify-between gap-3 py-3'>
                    <Skeleton className='w-24 text-sm text-muted-foreground'>
                      &nbsp;
                    </Skeleton>
                    <Skeleton className='w-20 font-mono text-xs font-medium'>
                      &nbsp;
                    </Skeleton>
                  </div>
                  <div className='flex justify-between gap-3 py-3'>
                    <Skeleton className='w-16 text-sm text-muted-foreground'>
                      &nbsp;
                    </Skeleton>
                    <Skeleton className='w-12 text-sm font-medium'>
                      &nbsp;
                    </Skeleton>
                  </div>
                  <div className='flex justify-between gap-3 py-3'>
                    <Skeleton className='w-20 text-sm text-muted-foreground'>
                      &nbsp;
                    </Skeleton>
                    <Skeleton className='w-16 text-sm font-medium'>
                      &nbsp;
                    </Skeleton>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <div className='rounded-lg border border-warning/20 bg-warning/10 p-4'>
              <div className='flex items-start gap-3'>
                <Skeleton className='size-5 shrink-0 rounded-full' />
                <div className='space-y-1'>
                  <Skeleton className='w-36 text-sm font-medium'>
                    &nbsp;
                  </Skeleton>
                  <Skeleton className='w-48 text-xs text-muted-foreground'>
                    &nbsp;
                  </Skeleton>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
