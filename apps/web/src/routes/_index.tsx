import { CareSection } from '@/components/landing/care-section'
import { LandingHeader } from '@/components/landing/header'
import { HeroSectoon } from '@/components/landing/hero-section'
import { HowItWorkSection } from '@/components/landing/how-it-work-section'
import { StoriesSection } from '@/components/landing/stories-section'
import { WaitlistSection } from '@/components/landing/waitlist-section'

import type { Route } from './+types/_index'

export const meta: Route.MetaFunction = () => [
  { title: 'Rozumari - Thoughtful technology for everyday care' },
]

export default function IndexPage() {
  return (
    <>
      <LandingHeader />
      <main className='min-h-dvh overflow-hidden'>
        <HeroSectoon />

        <section
          className='border-y bg-muted/40'
          aria-label='Rozumari highlights'
        >
          <div className='mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8'>
            <p className='font-medium text-foreground'>
              Designed for real routines, not perfect ones.
            </p>
            <div className='flex flex-wrap gap-x-7 gap-y-2'>
              <span>Simple by design</span>
              <span>Private by default</span>
              <span>Ready for real life</span>
            </div>
          </div>
        </section>

        <CareSection />

        <HowItWorkSection />

        <StoriesSection />

        <WaitlistSection />
      </main>

      <footer className='border-t'>
        <div className='mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8'>
          <p className='font-serif text-lg font-semibold text-foreground'>
            Rozumari
          </p>
          <p>Thoughtful technology for everyday care.</p>
        </div>
      </footer>
    </>
  )
}
