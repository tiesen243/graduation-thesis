import {
  BellRingIcon,
  HeartPulseIcon,
  ShieldCheckIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'

const benefits = [
  {
    icon: BellRingIcon,
    eyebrow: 'Right on time',
    title: 'A gentle nudge, not another alarm.',
    description:
      'Rozumari lights up and gives a soft reminder when it is time for the next dose.',
  },
  {
    icon: HeartPulseIcon,
    eyebrow: 'Stay in sync',
    title: 'See adherence at a glance.',
    description:
      'Know what was taken, what is coming up, and where support is needed without the guesswork.',
  },
  {
    icon: ShieldCheckIcon,
    eyebrow: 'Peace of mind',
    title: 'Care that keeps everyone close.',
    description:
      'Share the right updates with family and care teams while keeping daily life private and simple.',
  },
]

export function CareSection() {
  return (
    <section id='care' className='container px-6 py-24 lg:px-8 lg:py-32'>
      <Typography className='text-sm font-semibold tracking-[0.18em] text-primary uppercase'>
        A calmer way to care
      </Typography>
      <Typography variant='h2' className='mt-4 font-serif'>
        The little things add up to a lot of reassurance.
      </Typography>

      <ul className='mt-14 grid gap-px overflow-hidden rounded-3xl border bg-border md:grid-cols-3'>
        {benefits.map((benefit) => (
          <li key={benefit.title} className='space-y-3 bg-background p-4'>
            <benefit.icon className='size-6 text-primary' aria-hidden='true' />
            <Typography className='text-xs font-semibold text-muted-foreground uppercase'>
              {benefit.eyebrow}
            </Typography>
            <Typography variant='h3'>{benefit.title}</Typography>
            <Typography className='text-muted-foreground'>
              {benefit.description}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  )
}
