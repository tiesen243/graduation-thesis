import { Button } from '@rozumari/ui/components/button'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@rozumari/ui/components/icons'
import { Link } from 'react-router'

export function HeroSectoon() {
  return (
    <section
      id='top'
      className='mx-auto grid max-w-7xl items-center gap-12 px-6 pt-10 pb-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pt-16 lg:pb-28'
    >
      <div className='max-w-xl'>
        <div className='mb-7 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm'>
          <span
            className='size-1.5 rounded-full bg-primary'
            aria-hidden='true'
          />
          Medication, made more human
        </div>
        <h1 className='font-serif text-5xl leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl'>
          More confidence in every dose.
        </h1>
        <p className='mt-7 max-w-lg text-lg leading-8 text-pretty text-muted-foreground'>
          Rozumari is the beautifully simple smart pill box that helps people
          take medication on time — and helps the people who care about them
          breathe easier.
        </p>
        <div className='mt-9 flex flex-col gap-3 sm:flex-row'>
          <Button
            render={<Link to='#waitlist' />}
            nativeButton={false}
            size='lg'
            className='rounded-full px-6'
          >
            Get early access
            <ArrowRightIcon data-icon='inline-end' />
          </Button>
          <Button
            render={<Link to='#how-it-works' />}
            nativeButton={false}
            size='lg'
            variant='ghost'
            className='rounded-full px-6'
          >
            See how it works <ChevronRightIcon data-icon='inline-end' />
          </Button>
        </div>
        <div className='mt-10 flex items-center gap-6 border-t pt-6 text-sm text-muted-foreground'>
          <span className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-primary' /> No complicated setup
          </span>
          <span className='flex items-center gap-2'>
            <CheckIcon className='size-4 text-primary' /> Built with clinicians
          </span>
        </div>
      </div>

      <div className='relative'>
        <div
          className='absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl'
          aria-hidden='true'
        />
        <div className='overflow-hidden rounded-[2rem] border bg-card shadow-2xl shadow-primary/10'>
          <img
            src='/rozumari-hero.png'
            alt='Rozumari smart pill box beside a glass of water'
            className='aspect-4/3 w-full object-cover'
            width={1200}
            height={900}
          />
          <div className='flex items-center justify-between gap-4 border-t px-5 py-4 sm:px-7'>
            <div>
              <p className='text-sm font-semibold'>Good morning, NigeR</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Your morning routine is ready.
              </p>
            </div>
            <span className='rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary'>
              All on track
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
