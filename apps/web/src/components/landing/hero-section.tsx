import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { Link } from 'react-router'

export function HeroSectoon() {
  return (
    <section
      id='top'
      className='container grid items-center gap-12 pt-10 pb-20 lg:grid-cols-[0.92fr_1.08fr] lg:pt-16 lg:pb-28'
    >
      <h2 className='sr-only'>Hero section</h2>

      <section className='space-y-4'>
        <h3 className='sr-only'>Hero content</h3>

        <Badge variant='secondary' className='h-7 px-3 py-1'>
          <span
            className='mr-1 size-1.5 rounded-full bg-primary'
            aria-hidden='true'
          />
          Medication, made more human
        </Badge>

        <Typography variant='h1' as='p' className='font-serif'>
          More confidence in every dose.
        </Typography>

        <Typography className='text-muted-foreground'>
          Rozumari is the beautifully simple smart pill box that helps people
          take medication on time — and helps the people who care about them
          breathe easier.
        </Typography>

        <div className='flex flex-col gap-4 sm:flex-row'>
          <Button size='lg' nativeButton={false} render={<Link to='#cta' />}>
            Get started <ArrowRightIcon data-icon='inline-end' />
          </Button>

          <Button
            size='lg'
            variant='ghost'
            nativeButton={false}
            render={<Link to='#how-it-works' />}
          >
            See how it works <ChevronRightIcon data-icon='inline-end' />
          </Button>
        </div>

        <div className='mt-10 flex items-center gap-6 border-t pt-6 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:text-primary'>
          <span className='flex items-center gap-2'>
            <CheckIcon /> No complicated setup
          </span>
          <span className='flex items-center gap-2'>
            <CheckIcon /> Built with clinicians
          </span>
        </div>
      </section>

      <section className='overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10'>
        <h3 className='sr-only'>Hero image</h3>

        <img
          src='https://images.unsplash.com/photo-1677167643883-b4c703a5da35?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          alt='Rozumari smart pill box beside a glass of water'
          className='aspect-4/3 w-full object-cover'
          width={1200}
          height={900}
        />

        <div className='flex items-center justify-between gap-4 border-t p-4'>
          <div className='space-y-1'>
            <Typography className='text-sm font-semibold'>
              Good morning, NigeR
            </Typography>
            <Typography className='text-xs text-muted-foreground'>
              Your morning routine is ready.
            </Typography>
          </div>

          <Badge variant='info'>All on track</Badge>
        </div>
      </section>
    </section>
  )
}
