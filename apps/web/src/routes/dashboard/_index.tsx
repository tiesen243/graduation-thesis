import { UserRole } from '@rozumari/contract/user/schemas/user.schema'
import { Typography } from '@rozumari/ui/components/typography'

import { useSession } from '@/lib/use-session'
import { AdminDashboard } from '@/routes/dashboard/_components/dashboard/admin'
import { UserDashboard } from '@/routes/dashboard/_components/dashboard/user'

export default function DashboardIndexPage() {
  const { user } = useSession()
  if (!user) return null

  return (
    <>
      <Typography variant='h2'>Dashboard</Typography>
      <Typography>
        Welcome back, {user.username}!{' '}
        {user.role === UserRole.make('admin')
          ? "Here is what's happening across the system today."
          : 'Here is your daily health and medication overview.'}
      </Typography>

      {user.role === UserRole.make('admin') ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </>
  )
}
