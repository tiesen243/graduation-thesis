import { Typography } from '@rozumari/ui/components/typography'

import { createMetadata } from '@/lib/metadata'
import { Schedules } from '@/routes/dashboard/_components/schedule'

import type { Route } from './+types/_index'

export const meta: Route.MetaFunction = () =>
  createMetadata({
    title: 'Schedules',
    description: 'Manage schedules for your devices.',
  })

export default function SchedulesPage() {
  return (
    <>
      <Typography variant='h2'>Schedules</Typography>
      <Typography>Manage schedules for your devices.</Typography>

      <Schedules />
    </>
  )
}
