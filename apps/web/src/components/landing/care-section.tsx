import {
  BellRingIcon,
  HeartPulseIcon,
  ShieldCheckIcon,
} from '@rozumari/ui/components/icons'

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
    <section
      id='care'
      className='mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32'
    >
      <div className='max-w-2xl'>
        <p className='text-sm font-semibold tracking-[0.18em] text-primary uppercase'>
          A calmer way to care
        </p>
        <h2 className='mt-4 font-serif text-4xl tracking-tight text-balance sm:text-5xl'>
          The little things add up to a lot of reassurance.
        </h2>
      </div>
      <div className='mt-14 grid gap-px overflow-hidden rounded-3xl border bg-border md:grid-cols-3'>
        {benefits.map((benefit) => (
          <article key={benefit.title} className='bg-background p-7 lg:p-9'>
            <benefit.icon className='size-6 text-primary' aria-hidden='true' />
            <p className='mt-12 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
              {benefit.eyebrow}
            </p>
            <h3 className='mt-3 text-2xl font-semibold tracking-tight'>
              {benefit.title}
            </h3>
            <p className='mt-4 leading-7 text-muted-foreground'>
              {benefit.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
