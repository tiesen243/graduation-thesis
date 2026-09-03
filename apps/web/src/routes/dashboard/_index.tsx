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
        Welcome to the Rozumari dashboard! Here you can manage your patients,
        devices, and schedules. Use the sidebar to navigate through the
        different sections of the dashboard.
      </Typography>

      {user.role === UserRole.make('admin') ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </>
  )
}
