import type { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardHeader,
  CardContent,
  CardAction,
} from '@rozumari/ui/components/card'
import {
  MoreHorizontalIcon,
  PackageIcon,
  PillIcon,
  PlusIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'

export const CompartmentCard: React.FC<{
  item: CompartmentSchema
}> = ({ item }) => {
  const isFilled = Boolean(item.medicine)

  return (
    <Card className='flex flex-col justify-between'>
      <CardHeader>
        <Typography className='text-sm font-semibold'>
          SLOT {item.position}
        </Typography>

        <CardAction>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={`More options for compartment ${item.position}`}
          >
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col justify-between'>
        {isFilled ? (
          <>
            <div className='flex flex-col items-center justify-center'>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <PillIcon className='size-5' />
              </div>

              <Typography
                variant='h4'
                className='font-semibold text-foreground'
                title={item.medicine ?? undefined}
              >
                {item.medicine}
              </Typography>

              {item.dosage !== null && (
                <Typography variant='caption' className='text-muted-foreground'>
                  {item.dosage} mg / unit
                </Typography>
              )}
            </div>

            <div className='flex h-9 items-baseline justify-between rounded-lg bg-muted px-3'>
              <Typography
                variant='caption'
                className='font-medium text-muted-foreground'
                as='span'
              >
                Quantity
              </Typography>

              <div className='flex items-baseline gap-1'>
                <span className='text-lg font-bold'>{item.capacity}</span>
                <span className='text-xs text-muted-foreground'>pills</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='mb-2 flex aspect-video flex-col items-center justify-center gap-3 rounded-md bg-muted/60 text-muted-foreground/70'>
              <PackageIcon className='size-5' />

              <Typography variant='small' className='font-medium'>
                Empty compartment
              </Typography>
            </div>

            <Button variant='outline' size='lg' className='border-dashed'>
              <PlusIcon />
              Add medication
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
