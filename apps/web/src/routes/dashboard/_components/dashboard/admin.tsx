import type { ChartConfig } from '@rozumari/ui/components/chart'

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
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@rozumari/ui/components/chart'
import {
  AlertTriangle,
  Clock,
  Cpu,
  Info,
  Link,
  Users,
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
    label: 'Failed / Missed',
    color: 'var(--color-destructive)',
  },
} satisfies ChartConfig

const deviceChartConfig = {
  linked: {
    label: 'Linked',
    color: 'var(--color-chart-3)',
  },
  unlinked: {
    label: 'Unlinked',
    color: 'var(--color-muted)',
  },
} satisfies ChartConfig

export const AdminDashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery(
    api.dashboard.admin.queryOptions()
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
        An error occurred while loading dashboard data.
      </div>
    )
  }

  const { metrics, recentAlerts } = data.data

  const scheduleChartData = [
    {
      status: 'Completed',
      count: metrics.schedules.completed,
      fill: 'var(--color-success)',
    },
    {
      status: 'Pending',
      count: metrics.schedules.pending,
      fill: 'var(--color-warning)',
    },
    {
      status: 'Failed',
      count: metrics.schedules.failed,
      fill: 'var(--color-destructive)',
    },
  ]

  const unlinkedDevices = Math.max(
    0,
    metrics.totalDevices - metrics.linkedDevices
  )
  const deviceChartData = [
    {
      name: 'Linked',
      value: metrics.linkedDevices,
      fill: 'var(--color-chart-3)',
    },
    {
      name: 'Unlinked',
      value: unlinkedDevices,
      fill: 'var(--color-muted-foreground)',
    },
  ]

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
        <p className='text-sm text-muted-foreground'>
          System overview, performance analytics, and recent alerts.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Devices</CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalDevices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Linked Devices
            </CardTitle>
            <Link className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.linkedDevices}</div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Schedule Analytics</CardTitle>
            <CardDescription>
              Breakdown of medication schedules by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={scheduleChartConfig}
              className='min-h-55 w-full'
            >
              <BarChart data={scheduleChartData}>
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
            <CardTitle>Device Status</CardTitle>
            <CardDescription>
              Ratio of linked vs unlinked devices
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center'>
            <ChartContainer
              config={deviceChartConfig}
              className='min-h-55 w-full max-w-75'
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey='name' />}
                />
                <Pie
                  data={deviceChartData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No recent alerts.</p>
          ) : (
            <div className='divide-y'>
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className='flex items-start justify-between py-3 first:pt-0 last:pb-0'
                >
                  <div className='flex items-start space-x-3'>
                    {alert.level === 'error' && (
                      <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-destructive' />
                    )}
                    {alert.level === 'warning' && (
                      <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-warning' />
                    )}
                    {alert.level === 'info' && (
                      <Info className='mt-0.5 h-5 w-5 shrink-0 text-info' />
                    )}

                    <div>
                      <p className='text-sm font-medium'>{alert.title}</p>
                      <p className='text-xs text-muted-foreground'>
                        {alert.body}
                      </p>
                    </div>
                  </div>

                  <div className='flex shrink-0 items-center pl-4 text-xs text-muted-foreground'>
                    <Clock className='mr-1 h-3 w-3' />
                    {new Date(alert.createdAt).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
