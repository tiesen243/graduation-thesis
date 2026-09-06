import { Typography } from '@rozumari/ui/components/typography'

import { Schedules } from '@/routes/dashboard/_components/schedule'

export default function SchedulesPage() {
  return (
    <>
      <Typography variant='h2'>Schedules</Typography>
      <Typography>Manage schedules for your devices.</Typography>

      <Schedules />
    </>
  )
}
