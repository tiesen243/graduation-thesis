import { Button } from '@rozumari/ui/components/button'
import { Link } from 'react-router'

import Logo from '@/assets/favicon.svg'

export function LandingHeader() {
  return (
    <header
      className='sticky inset-0 z-50 bg-popover/70 py-6 backdrop-blur-2xl backdrop-saturate-150'
      aria-label='Main navigation'
    >
      <nav className='container flex items-center justify-between'>
        <Link
          to='#top'
          className='flex items-center gap-3'
          aria-label='Rozumari home'
        >
          <span className='flex size-9 items-center justify-center rounded-md bg-chart-1'>
            <img src={Logo} alt='Rozumari logo' className='size-5' />
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
          <Link
            to='#stories'
            className='transition-colors hover:text-foreground'
          >
            Stories
          </Link>
        </div>

        <Button
          variant='outline'
          nativeButton={false}
          render={<Link to='login' />}
        >
          Get started
        </Button>
      </nav>
    </header>
  )
}
