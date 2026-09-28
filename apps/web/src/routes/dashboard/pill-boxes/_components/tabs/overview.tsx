import { TabsContent } from '@rozumari/ui/components/tabs'
import { Typography } from '@rozumari/ui/components/typography'

import { CompartmentCard } from '@/routes/dashboard/pill-boxes/_components/compartment-card'
import { DropPillButton } from '@/routes/dashboard/pill-boxes/_components/drop-pill-button'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

export const OverviewTab: React.FC = () => {
  const { device } = useDevice()
  if (!device) return null

  return (
    <TabsContent value='overview'>
      <div className='mt-4 mb-3 flex items-end justify-between'>
        <div>
          <Typography variant='h3' className='text-base'>
            Medication compartments
          </Typography>
          <Typography className='mt-1 text-sm text-muted-foreground'>
            Manage the medication stored in each slot.
          </Typography>
        </div>

        <DropPillButton id={device.id} compartments={device.compartments} />
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {device.compartments.map((item) => (
          <CompartmentCard key={item.position} item={item} />
        ))}
      </div>
    </TabsContent>
  )
}
