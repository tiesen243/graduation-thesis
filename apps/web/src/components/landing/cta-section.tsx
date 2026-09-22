import { Button } from '@rozumari/ui/components/button'
import { ArrowRightIcon, DownloadIcon } from '@rozumari/ui/components/icons'
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

        <div className='flex justify-center gap-4'>
          <Button size='lg' nativeButton={false} render={<Link to='/login' />}>
            Get Started <ArrowRightIcon data-icon='inline-end' />
          </Button>

          <Button
            size='lg'
            variant='outline'
            nativeButton={false}
            render={
              <a
                href='https://github.com/tiesen243/graduation-thesis/releases?q=%22%40rozumari%2Fmobile%22&expanded=true'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Download mobile app'
              />
            }
          >
            Download mobile app <DownloadIcon data-icon='inline-end' />
          </Button>
        </div>
      </div>
    </section>
  )
}
