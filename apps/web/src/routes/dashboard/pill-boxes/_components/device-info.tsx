import { Badge } from '@rozumari/ui/components/badge'
import {
  MapPinIcon,
  ServerIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'

import { UpdateDeviceDialog } from '@/routes/dashboard/pill-boxes/_components/update-device-dialog'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

// oxlint-disable-next-line typescript/no-inferrable-types
const status: string = 'pending'

export const DeviceInfo: React.FC = () => {
  const { device } = useDevice()
  if (!device) return null

  return (
    <section className='flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
      <div className='space-y-2'>
        <Badge
          variant='secondary'
          className={cn('gap-2', {
            'text-warning': status === 'idle',
            'text-info': status === 'connecting',
            'text-success': status === 'pending',
            'text-destructive': status === 'error',
          })}
        >
          <span
            className={cn('size-2 rounded-full', {
              'bg-warning/90': status === 'idle',
              'bg-info/90': status === 'connecting',
              'bg-success/90': status === 'pending',
              'bg-destructive/90': status === 'error',
            })}
          />
          Online · Last seen just now
        </Badge>

        <Typography variant='h2' as='h3'>
          {device.name ?? device.factoryModel}
        </Typography>
        <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground [&_svg]:size-4'>
          <span className='flex items-center gap-1.5'>
            <MapPinIcon /> {device.position ?? 'unknown location'}
          </span>
          <span className='flex items-center gap-1.5'>
            <ServerIcon /> {device.status}
          </span>
        </div>
      </div>

      <UpdateDeviceDialog />
    </section>
  )
}
