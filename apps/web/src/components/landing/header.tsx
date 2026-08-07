import { Button } from '@rozumari/ui/components/button'
import { SparklesIcon } from '@rozumari/ui/components/icons'
import { Link } from 'react-router'

export function LandingHeader() {
  return (
    <header
      className='mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8'
      aria-label='Main navigation'
    >
      <Link
        to='#top'
        className='flex items-center gap-3'
        aria-label='Rozumari home'
      >
        <span className='flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
          <SparklesIcon className='size-4' aria-hidden='true' />
        </span>
        <span className='font-serif text-xl font-semibold tracking-tight'>
          Rozumari
        </span>
      </Link>
      <div className='hidden items-center gap-8 text-sm text-muted-foreground md:flex'>
        <Link
          to='#how-it-works'
          className='transition-colors hover:text-foreground'
        >
          How it works
        </Link>
        <Link to='#care' className='transition-colors hover:text-foreground'>
          For families
        </Link>
        <Link to='#stories' className='transition-colors hover:text-foreground'>
          Stories
        </Link>
      </div>
      <Button
        render={<Link to='#waitlist' />}
        nativeButton={false}
        variant='outline'
        className='rounded-full px-5'
      >
        Join the waitlist
      </Button>
    </header>
  )
}
