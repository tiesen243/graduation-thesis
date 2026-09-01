import { buttonVariants } from '@rozumari/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  CalendarDaysIcon,
  CheckIcon,
  SmartphoneIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import { api } from '@/lib/runtime'
import { formatDate } from '@/lib/utils'
import { levelMeta } from '@/routes/dashboard/_components/notification-list'

import type { Route } from './+types/[id]'

export default function NotificationDetailsPage({
  params,
}: Route.ComponentProps) {
  const { data } = useQuery(
    api.notification.show.queryOptions({ params: params as never })
  )

  if (!data?.data) return null

  const notification = data.data
  const meta = levelMeta[notification.level as keyof typeof levelMeta]

  return (
    <>
      <div className='flex items-start gap-4'>
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${meta.iconClass}`}
        >
          <meta.icon className='size-7' />
        </div>

        <div className='flex flex-col gap-2'>
          <Typography variant='h2'>{notification.title}</Typography>

          <p className='text-sm text-muted-foreground'>
            Received {formatDate(notification.createdAt)}
          </p>
        </div>
      </div>

      <Card className='mt-4'>
        <CardContent className='flex flex-col gap-2'>
          <Typography>{notification.body}</Typography>

          <Typography variant='ul'>
            {Object.entries(notification.payload ?? {}).map(([key, value]) => (
              <li key={key}>
                <strong className='capitalize'>{key}:</strong>{' '}
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
              </li>
            ))}
          </Typography>
        </CardContent>
        <CardFooter>
          <CheckIcon className='mr-2 size-4 text-primary' /> Read{' '}
          {notification.readAt ? formatDate(notification.readAt) : 'Not yet'}
        </CardFooter>
      </Card>

      <section className='mt-4 flex flex-col gap-4'>
        <Typography variant='h3'>Related information</Typography>
        <p className='-mt-2 text-sm text-muted-foreground'>
          Context connected to this notification.
        </p>

        <div className='grid gap-3 sm:grid-cols-2'>
          <Card>
            <CardHeader className='flex items-center gap-2'>
              <SmartphoneIcon className='size-4 text-primary' /> Device
            </CardHeader>

            <CardFooter className='justify-between'>
              <span className='font-mono text-sm text-muted-foreground'>
                {notification.deviceId}
              </span>

              <Link
                className={buttonVariants({ variant: 'link' })}
                to={`/dashboard/pill-boxes/${notification.deviceId}`}
              >
                View device <span aria-hidden='true'>↗</span>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className='flex items-center gap-2'>
              <CalendarDaysIcon className='size-4 text-primary' /> Schedule
            </CardHeader>

            {notification.scheduleId ? (
              <CardFooter className='justify-between'>
                <span className='font-mono text-sm text-muted-foreground'>
                  {notification.scheduleId}
                </span>

                <Link
                  className={buttonVariants({ variant: 'link' })}
                  to={`/dashboard/schedules/${notification.scheduleId}`}
                >
                  View schedule <span aria-hidden='true'>↗</span>
                </Link>
              </CardFooter>
            ) : (
              <CardFooter className='justify-between'>
                <span className='text-sm text-muted-foreground'>
                  No schedule associated
                </span>
              </CardFooter>
            )}
          </Card>
        </div>

        <Card className='flex-row justify-between bg-background px-4'>
          <CardTitle>Notification ID</CardTitle>
          <CardDescription>{notification.id}</CardDescription>
        </Card>
      </section>
    </>
  )
}
