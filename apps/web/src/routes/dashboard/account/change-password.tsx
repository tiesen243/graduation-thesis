import { createMetadata } from '@/lib/metadata'
import { ChangePasswordForm } from '@/routes/dashboard/account/_components/change-password-form'

import type { Route } from './+types/change-password'

export const meta: Route.MetaFunction = () =>
  createMetadata({
    title: 'Change Password',
    description: 'Update your password to keep your account secure.',
  })

export default function ChangePasswordPage() {
  return <ChangePasswordForm />
}
