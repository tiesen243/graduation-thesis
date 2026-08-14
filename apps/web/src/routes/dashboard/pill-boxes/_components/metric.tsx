import type { LucideIcon } from '@rozumari/ui/components/icons'

import { Typography } from '@rozumari/ui/components/typography'

interface MetricProps {
  icon: LucideIcon
  label: string
  value: string
  detail: string
}

export const Metric: React.FC<MetricProps> = ({
  icon: Icon,
  label,
  value,
  detail,
}) => (
  <div className='flex items-start gap-3'>
    <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
      <Icon />
    </div>
    <div>
      <Typography variant='small' className='text-muted-foreground'>
        {label}
      </Typography>
      <Typography variant='h4' className='mt-0.5'>
        {value}
      </Typography>
      <Typography variant='caption' className='text-left'>
        {detail}
      </Typography>
    </div>
  </div>
)
