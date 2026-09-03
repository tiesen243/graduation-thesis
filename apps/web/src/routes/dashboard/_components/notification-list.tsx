import type { ListNotificationsDto } from '@rozumari/contract/notification/dto/list-notifications.dto'

import {
  CircleAlertIcon,
  Clock3Icon,
  InfoIcon,
} from '@rozumari/ui/components/icons'
import { Skeleton } from '@rozumari/ui/components/skeleton'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useMemo } from 'react'
import { Link } from 'react-router'

import { formatDate } from '@/lib/utils'

export const levelMeta = {
  error: {
    icon: CircleAlertIcon,
    iconClass: 'bg-destructive/10 text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive',
  },
  warning: {
    icon: Clock3Icon,
    iconClass: 'bg-warning/10 text-warning',
    badgeClass: 'bg-warning/10 text-warning',
  },
  info: {
    icon: InfoIcon,
    iconClass: 'bg-info/10 text-info',
    badgeClass: 'bg-info/10 text-info',
  },
}

function formatGroup(date: Date) {
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (
    date.toDateString() ===
    new Date(today.getTime() - 86_400_000).toDateString()
  )
    return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const NotificationList: React.FC<{
  notifications: ListNotificationsDto[]
}> = ({ notifications }) => {
  const groups = useMemo(() => {
    const notificationList = notifications.flatMap(
      (noti) => noti.data.notifications
    )

    const grouped: Record<
      string,
      ListNotificationsDto.Output['notifications'][number][]
    > = {}
    for (const item of notificationList) {
      const group = formatGroup(item.createdAt)
      if (!grouped[group]) grouped[group] = []
      grouped[group].push(item)
    }

    return grouped
  }, [notifications])

  return Object.entries(groups).map(([group, items]) => (
    <section
      key={group}
      aria-labelledby={group}
      className='mt-2 flex flex-col gap-3'
    >
      <Typography id={group} variant='h4'>
        {group}
      </Typography>

      <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
        {items.map((item, index) => {
          const meta = levelMeta[item.level as keyof typeof levelMeta]

          return (
            <Link
              key={item.id}
              to={`/dashboard/notifications/${item.id}`}
              className={cn(
                'group relative flex gap-4 p-4 transition-colors hover:bg-muted/40',
                index < items.length - 1 ? 'border-b border-border' : ''
              )}
            >
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg',
                  meta.iconClass
                )}
              >
                <meta.icon aria-hidden='true' className='size-5' />
              </div>

              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                  <div className='flex items-center gap-2'>
                    <h5
                      className={cn(
                        'font-semibold',
                        item.readAt ? 'text-foreground/80' : 'text-foreground'
                      )}
                    >
                      {item.title}
                    </h5>

                    {!item.readAt && (
                      <span className='size-1.5 rounded-full bg-primary' />
                    )}
                  </div>
                </div>

                <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
                  {item.body}
                </p>

                <time
                  dateTime={item.createdAt.toISOString()}
                  className='absolute top-4 right-4 text-xs text-muted-foreground'
                >
                  {formatDate(item.createdAt)}
                </time>
              </div>
            </Link>
          )
        })}
      </section>
    </section>
  ))
}

export const NotificationListSkeleton: React.FC<{ count?: number }> = ({
  count = 2,
}) => (
  <>
    {Array.from({ length: count }, (_, groupIndex) => (
      <section key={groupIndex} className='mt-2 flex flex-col gap-3'>
        <Skeleton className='w-40 text-lg font-semibold'>&nbsp;</Skeleton>

        <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          {Array.from({ length: 3 }, (__, itemIndex) => (
            <div
              key={itemIndex}
              className='relative flex gap-4 border-b border-border p-4 last:border-b-0'
            >
              {/* Skeleton for Icon Box */}
              <Skeleton className='size-10 shrink-0 rounded-lg' />

              {/* Skeleton for Content Area */}
              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                  <div className='flex items-center gap-2'>
                    {/* Skeleton for Title (h5) */}
                    <Skeleton className='w-40 text-base font-semibold'>
                      &nbsp;
                    </Skeleton>
                  </div>
                </div>

                {/* Skeleton for Body Text */}
                <div className='flex max-w-2xl flex-col gap-1'>
                  <Skeleton className='w-full text-sm leading-6'>
                    &nbsp;
                  </Skeleton>
                  <Skeleton className='w-2/3 text-sm leading-6'>
                    &nbsp;
                  </Skeleton>
                </div>

                {/* Skeleton for Time Stamp */}
                <Skeleton className='absolute top-4 right-4 w-12 text-xs'>
                  &nbsp;
                </Skeleton>
              </div>
            </div>
          ))}
        </section>
      </section>
    ))}
  </>
)
