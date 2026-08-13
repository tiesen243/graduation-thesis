import type { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardHeader,
  CardContent,
  CardAction,
} from '@rozumari/ui/components/card'
import { MoreHorizontalIcon, PackageIcon } from '@rozumari/ui/components/icons'
import { Progress } from '@rozumari/ui/components/progress'
import { Typography } from '@rozumari/ui/components/typography'

export const CompartmentCard: React.FC<{
  item: CompartmentSchema
}> = ({ item }) => {
  const filled = Boolean(item.medicine)
  const percentage =
    item.maxCapacity > 0
      ? Math.round((item.capacity / item.maxCapacity) * 100)
      : 0

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <Typography variant='h4' className='text-sm'>
          {item.medicine ?? 'Empty compartment'}
        </Typography>
        <Typography
          variant='code'
          className='border-0 bg-transparent p-0 text-xs'
        >
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

      <div className='flex-1' />

      <CardContent className='flex flex-col items-center'>
        {filled ? (
          <>
            <Progress value={percentage} className='w-full' />

            <div className='mt-3 flex w-full justify-between'>
              <Typography className='font-semibold'>
                {item.capacity}{' '}
                <span className='font-normal text-muted-foreground'>
                  / {item.maxCapacity}
                </span>
              </Typography>

              <Typography variant='caption' as='p'>
                {percentage}% full
              </Typography>
            </div>
          </>
        ) : (
          <>
            <PackageIcon className='text-muted-foreground/60' />
            <Typography variant='small' className='mt-2 text-muted-foreground'>
              Empty compartment
            </Typography>
            <Button variant='link' size='sm'>
              Add medication
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
