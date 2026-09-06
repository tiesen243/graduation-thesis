import { Typography } from '@rozumari/ui/components/typography'

const steps = [
  'Load the compartments once a week.',
  'Set a schedule in the Rozumari app.',
  'Let the box and your care circle handle the rest.',
]

export function HowItWorkSection() {
  return (
    <section
      id='how-it-works'
      className='bg-secondary text-secondary-foreground'
    >
      <div className='container grid gap-12 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:py-28'>
        <div className='space-y-4'>
          <Typography className='text-sm font-semibold uppercase opacity-70'>
            How it works
          </Typography>
          <Typography variant='h2' className='font-serif'>
            One less thing to keep in your head.
          </Typography>
          <Typography className='opacity-75'>
            A thoughtful system that turns medication management into a quiet,
            dependable part of the day.
          </Typography>
        </div>

        <ol className='grid gap-4 sm:grid-cols-3'>
          {steps.map((step, index) => (
            <li
              key={step}
              className='rounded-2xl border border-primary-foreground/20 p-4'
            >
              <Typography as='span' className='font-serif text-3xl opacity-50'>
                0{index + 1}
              </Typography>
              <Typography className='mt-12 text-lg font-medium tracking-tight'>
                {step}
              </Typography>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
