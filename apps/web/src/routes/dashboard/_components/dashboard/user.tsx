import type { ChartConfig } from '@rozumari/ui/components/chart'

import { Badge } from '@rozumari/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@rozumari/ui/components/chart'
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  Clock,
  Cpu,
  Info,
  Pill,
} from '@rozumari/ui/components/icons'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

import { api } from '@/lib/runtime'

const scheduleChartConfig = {
  completed: {
    label: 'Completed',
    color: 'var(--color-success)',
  },
  pending: {
    label: 'Pending',
    color: 'var(--color-warning)',
  },
  failed: {
    label: 'Missed',
    color: 'var(--color-destructive)',
  },
} satisfies ChartConfig

export const UserDashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery(
    api.dashboard.user.queryOptions()
  )

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className='rounded-lg bg-destructive/10 p-4 text-destructive'>
        An error occurred while loading your dashboard.
      </div>
    )
  }

  const { metrics, devices, recentNotifications, lowStockCompartments } =
    data.data

  const todaySchedulesData = [
    {
      status: 'Completed',
      count: metrics.todaySchedules.completed,
      fill: 'var(--color-success)',
    },
    {
      status: 'Pending',
      count: metrics.todaySchedules.pending,
      fill: 'var(--color-warning)',
    },
    {
      status: 'Missed',
      count: metrics.todaySchedules.failed,
      fill: 'var(--color-destructive)',
    },
  ]

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>User Dashboard</h1>
        <p className='text-sm text-muted-foreground'>
          Track your medication schedules, device connectivity, and inventory.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>My Devices</CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalDevices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Today&apos;s Pending Dose
            </CardTitle>
            <CalendarClock className='h-4 w-4 text-warning' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics.todaySchedules.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Low Stock Alerts
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.lowStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>
              Overview of today&apos;s medication adherence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={scheduleChartConfig}
              className='min-h-50 w-full'
            >
              <BarChart data={todaySchedulesData}>
                <XAxis dataKey='status' tickLine={false} axisLine={false} />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='count' radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Pill className='h-5 w-5 text-warning' />
              <span>Low Stock Medicine</span>
            </CardTitle>
            <CardDescription>
              Compartments with capacity below 5 units
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockCompartments.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                All compartments are adequately stocked.
              </p>
            ) : (
              <div className='space-y-3'>
                {lowStockCompartments.map((comp, idx) => (
                  <div
                    key={`${comp.deviceId}-${comp.position}-${idx}`}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div>
                      <p className='font-medium'>{comp.medicine}</p>
                      <p className='text-xs text-muted-foreground'>
                        Position: Slot {comp.position}
                      </p>
                    </div>
                    <Badge variant='destructive'>{comp.capacity} left</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>My Devices</CardTitle>
            <CardDescription>Active and linked Smart Pillboxes</CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No devices connected yet.
              </p>
            ) : (
              <div className='space-y-3'>
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div>
                      <p className='font-medium'>{device.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        Model: {device.factoryModel}
                      </p>
                    </div>
                    <Badge
                      className={
                        device.status === 'linked'
                          ? 'bg-success text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {device.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentNotifications.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No recent notifications.
              </p>
            ) : (
              <div className='divide-y'>
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className='flex items-start justify-between py-3 first:pt-0 last:pb-0'
                  >
                    <div className='flex items-start space-x-3'>
                      {notification.level === 'error' && (
                        <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-destructive' />
                      )}
                      {notification.level === 'warning' && (
                        <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-warning' />
                      )}
                      {notification.level === 'info' && (
                        <Info className='mt-0.5 h-4 w-4 shrink-0 text-info' />
                      )}

                      <div>
                        <p className='text-sm font-medium'>
                          {notification.title}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {notification.body}
                        </p>
                      </div>
                    </div>

                    <div className='flex shrink-0 items-center pl-3 text-xs text-muted-foreground'>
                      <Clock className='mr-1 h-3 w-3' />
                      {new Date(notification.createdAt).toLocaleString(
                        'en-US',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
