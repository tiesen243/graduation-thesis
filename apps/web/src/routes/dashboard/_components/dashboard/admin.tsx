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
  AlertTriangleIcon,
  ClockIcon,
  CpuIcon,
  InfoIcon,
  LinkIcon,
  Loader2Icon,
  UsersIcon,
} from '@rozumari/ui/components/icons'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

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
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig

export const AdminDashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery(
    api.dashboard.admin.queryOptions()
  )

  if (isLoading) {
    return (
      <div className='flex min-h-[calc(100dvh-8rem)] items-center justify-center'>
        <Loader2Icon className='size-8 animate-spin' />
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
      fill: 'var(--color-chart-5)',
    },
  ]

  return (
    <>
      <div className='my-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <UsersIcon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='text-2xl font-bold'>
            {metrics.totalUsers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Devices</CardTitle>
            <CpuIcon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='text-2xl font-bold'>
            {metrics.totalDevices}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Linked Devices
            </CardTitle>
            <LinkIcon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='text-2xl font-bold'>
            {metrics.linkedDevices}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
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

      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No recent alerts.</p>
          ) : (
            <div className='divide-y'>
              {recentAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  to={`/dashboard/notifications/${alert.id}`}
                  className='flex items-start justify-between p-3 transition-colors hover:bg-accent/50 hover:text-accent-foreground'
                >
                  <div className='flex items-start space-x-3 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0'>
                    {alert.level === 'error' && (
                      <AlertTriangleIcon className='text-destructive' />
                    )}
                    {alert.level === 'warning' && (
                      <AlertTriangleIcon className='text-warning' />
                    )}
                    {alert.level === 'info' && (
                      <InfoIcon className='text-info' />
                    )}

                    <div>
                      <p className='font-medium'>{alert.title}</p>
                      <p className='text-sm text-muted-foreground'>
                        {alert.body}
                      </p>
                    </div>
                  </div>

                  <div className='flex shrink-0 items-center pl-4 text-xs text-muted-foreground'>
                    <ClockIcon className='mr-1 size-3' />
                    <span className='min-w-32'>
                      {new Date(alert.createdAt).toLocaleString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
