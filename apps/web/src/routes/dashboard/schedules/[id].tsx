// oxlint-disable no-use-before-define

import { Badge } from '@rozumari/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CpuIcon,
  PillIcon,
  XCircleIcon,
} from '@rozumari/ui/components/icons'
import { Skeleton } from '@rozumari/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@rozumari/ui/components/table'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/runtime'

import type { Route } from './+types/[id]'

const statusVariantMap = {
  completed: 'success',
  pending: 'warning',
  failed: 'destructive',
} as const

export default function ScheduleDetailsPage({ params }: Route.ComponentProps) {
  const { data, isLoading, isError } = useQuery(
    api.schedule.show.queryOptions({ params: params as never })
  )

  if (isLoading) return <ScheduleDetailsSkeleton />

  if (isError || !data)
    return (
      <div className='rounded-lg bg-destructive/10 p-4 text-destructive'>
        Failed to load schedule details or schedule does not exist.
      </div>
    )

  const { date, time, status, device, items } = data.data

  return (
    <>
      <div className='flex items-center justify-between gap-4'>
        <Typography variant='h2'>Schedule Details</Typography>

        <Badge
          variant={statusVariantMap[status as keyof typeof statusVariantMap]}
        >
          {status === 'completed' && (
            <>
              <CheckCircle2Icon className='mr-1' /> Completed
            </>
          )}

          {status === 'pending' && (
            <>
              <ClockIcon className='mr-1' /> Pending
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircleIcon className='mr-1' /> Missed
            </>
          )}
        </Badge>
      </div>
      <Typography className='text-muted-foreground'>
        View dose instructions, target device, and pill items for this schedule.
      </Typography>

      <div className='my-4 grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Schedule Timing
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center text-sm font-semibold'>
              <CalendarIcon className='mr-2 size-4 text-muted-foreground' />
              <span>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className='flex items-center text-sm font-semibold'>
              <ClockIcon className='mr-2 size-4 text-muted-foreground' />
              <span>{time}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Assigned Device
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <CpuIcon className='size-4 text-primary' />
                <span className='font-semibold'>{device.name}</span>
              </div>
              <Badge variant='outline'>Position: Slot {device.position}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <PillIcon className='size-4 text-primary' />
            <span>Medication Items</span>
          </CardTitle>

          <CardDescription>
            Detailed dosage and compartment slots required for this schedule
            run.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-30'>Slot</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead className='text-right'>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center text-muted-foreground'
                  >
                    No medication items attached to this schedule.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={`${item.slot}-${index}`}>
                    <TableCell>
                      <Badge variant='secondary'>Slot {item.slot}</Badge>
                    </TableCell>
                    <TableCell className='font-medium'>
                      {item.medicine}
                    </TableCell>
                    <TableCell>{item.dosage}</TableCell>
                    <TableCell className='text-right font-semibold'>
                      {item.quantity} pill(s)
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

const ScheduleDetailsSkeleton = () => (
  <>
    <div className='flex items-center justify-between gap-4'>
      <Skeleton className='w-48 text-2xl'>&nbsp;</Skeleton>
      <Badge variant='secondary' className='w-24 animate-pulse'>
        &nbsp;
      </Badge>
    </div>
    <Skeleton className='mt-2 w-96'>&nbsp;</Skeleton>

    <div className='my-4 grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader className='pb-3'>
          <Skeleton className='w-28 text-sm'>&nbsp;</Skeleton>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Skeleton className='w-44 text-sm'>&nbsp;</Skeleton>
          <Skeleton className='w-24 text-sm'>&nbsp;</Skeleton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <Skeleton className='w-28 text-sm'>&nbsp;</Skeleton>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Skeleton className='w-36'>&nbsp;</Skeleton>
            <Badge variant='secondary' className='w-28 animate-pulse'>
              &nbsp;
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <Skeleton className='w-40'>&nbsp;</Skeleton>
        <Skeleton className='w-80 text-sm'>&nbsp;</Skeleton>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-12 w-full' />
        </div>
      </CardContent>
    </Card>
  </>
)
