import type { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'
import type { LucideIcon } from '@rozumari/ui/components/icons'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@rozumari/ui/components/alert'
import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  BatteryMediumIcon,
  Clock3Icon,
  EllipsisIcon,
  PackageIcon,
  PillIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from '@rozumari/ui/components/icons'
import { TabsContent } from '@rozumari/ui/components/tabs'
import { Typography } from '@rozumari/ui/components/typography'
import { useMemo } from 'react'

import { CompartmentCard } from '@/routes/dashboard/devices/_components/compartment-card'
import { Metric } from '@/routes/dashboard/devices/_components/metric'

export const OverviewTab: React.FC<{ device: ShowDeviceDto.Output }> = ({
  device,
}) => {
  const alerts = useMemo(
    () =>
      device.compartments.filter((compartment) => {
        if (compartment.maxCapacity === 0) return false
        const percentage =
          (compartment.capacity / compartment.maxCapacity) * 100
        return percentage < 20
      }),
    [device.compartments]
  )

  return (
    <TabsContent value='overview'>
      <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[
          [ShieldCheckIcon, 'Device status', 'Healthy', 'No issues detected'],
          [
            PackageIcon,
            'Medication stock',
            '70 / 140',
            'Total pills remaining',
          ],
          [Clock3Icon, 'Next dose', 'Today, 8:00 AM', 'Lisinopril · 10 mg'],
          [BatteryMediumIcon, 'Battery', '87%', 'Estimated 12 days left'],
        ].map(([icon, label, value, detail]) => (
          <Card key={String(label)} className='px-4'>
            <Metric
              icon={icon as LucideIcon}
              label={String(label)}
              value={String(value)}
              detail={String(detail)}
            />
          </Card>
        ))}
      </div>

      <div className='mt-4 grid gap-4 lg:grid-cols-[1fr_300px]'>
        <section>
          <div className='mb-3 flex items-end justify-between'>
            <div>
              <Typography variant='h3' className='text-base'>
                Medication compartments
              </Typography>
              <Typography className='mt-1 text-sm text-muted-foreground'>
                Manage the medication stored in each slot.
              </Typography>
            </div>

            <Button variant='link' className='hidden sm:flex'>
              <RefreshCwIcon data-icon='inline-start' /> Sync device
            </Button>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {device.compartments.map((item) => (
              <CompartmentCard key={item.position} item={item} />
            ))}
          </div>
        </section>

        <aside className='flex flex-col gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Device information</CardTitle>

              <CardAction>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  aria-label='More device information'
                >
                  <EllipsisIcon />
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent>
              <dl className='divide-y text-sm'>
                <div className='flex justify-between gap-3 py-3'>
                  <dt className='text-muted-foreground'>Serial number</dt>
                  <dd className='font-mono text-xs font-medium'>
                    {device.factoryModel}
                  </dd>
                </div>
                <div className='flex justify-between gap-3 py-3'>
                  <dt className='text-muted-foreground'>Firmware</dt>
                  <dd className='font-medium'>v2.4.1</dd>
                </div>
                <div className='flex justify-between gap-3 py-3'>
                  <dt className='text-muted-foreground'>Last sync</dt>
                  <dd className='font-medium'>Just now</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {alerts.length > 0 && (
            <Alert variant='warning'>
              <PillIcon />

              <AlertTitle>Low medication stock</AlertTitle>
              <AlertDescription>
                {alerts.length} compartment
                {alerts.length > 1 ? 's are' : ' is'} running low on medication.
                Consider scheduling a refill soon.
              </AlertDescription>
            </Alert>
          )}
        </aside>
      </div>
    </TabsContent>
  )
}
