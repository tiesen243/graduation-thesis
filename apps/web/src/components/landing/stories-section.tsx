import { Typography } from '@rozumari/ui/components/typography'

export function StoriesSection() {
  return (
    <section id='stories' className='container py-24 lg:py-32'>
      <div className='grid gap-8 rounded-3xl border bg-card p-8 sm:p-12 lg:grid-cols-[0.7fr_1.3fr] lg:p-16'>
        <div className='space-y-4'>
          <Typography className='text-sm font-semibold tracking-[0.18em] text-primary uppercase'>
            A better feeling
          </Typography>
          <Typography variant='h2' className='font-serif'>
            “It gives us a gentle sense that someone has our back.”
          </Typography>
        </div>

        <div className='flex flex-col justify-between gap-8 lg:pl-12'>
          <Typography className='text-xl text-muted-foreground'>
            “My dad wants his independence, and I want to know he is okay.
            Rozumari finds the middle ground — it supports him without making
            every reminder feel like a check-in.”
          </Typography>
          <Typography className='text-sm font-semibold'>
            Elena, early Rozumari family
          </Typography>
        </div>
      </div>
    </section>
  )
}
