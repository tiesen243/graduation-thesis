import { Button } from '@rozumari/ui/components/button'
import { ArrowRightIcon } from '@rozumari/ui/components/icons'

export function WaitlistSection() {
  return (
    <section
      id='waitlist'
      className='mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28'
    >
      <div className='rounded-3xl border bg-muted/50 px-6 py-14 text-center sm:px-12'>
        <p className='text-sm font-semibold tracking-[0.18em] text-primary uppercase'>
          Coming soon
        </p>
        <h2 className='mx-auto mt-4 max-w-2xl font-serif text-4xl tracking-tight text-balance sm:text-5xl'>
          Make room for a little more peace of mind.
        </h2>
        <p className='mx-auto mt-5 max-w-xl leading-7 text-muted-foreground'>
          Join the early access list for product updates, launch pricing, and a
          chance to help shape Rozumari.
        </p>
        <Button size='lg' className='mt-8 rounded-full px-7'>
          Join the waitlist <ArrowRightIcon data-icon='inline-end' />
        </Button>
      </div>
    </section>
  )
}
