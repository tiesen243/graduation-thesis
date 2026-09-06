import { buttonVariants } from '@rozumari/ui/components/button'
import { ArrowRightIcon } from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { Link } from 'react-router'

export function CtaSection() {
  return (
    <section id='cta' className='container pb-20 lg:pb-28'>
      <div className='space-y-4 rounded-3xl border bg-muted/50 px-6 py-14 text-center sm:px-12'>
        <Typography className='text-sm font-semibold tracking-[0.18em] text-primary uppercase'>
          Get started today
        </Typography>

        <Typography variant='h2' className='font-serif'>
          Ready to bring peace of mind into your daily routine?
        </Typography>

        <Typography className='text-muted-foreground'>
          Experience how Rozumari can transform your workflow. Start your
          journey with us now.
        </Typography>

        <Link to='/login' className={buttonVariants({ size: 'lg' })}>
          Get Started <ArrowRightIcon data-icon='inline-end' />
        </Link>
      </div>
    </section>
  )
}
