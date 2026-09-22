import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@rozumari/ui/components/card'

import { createMetadata } from '@/lib/metadata'
import { ForgotPasswordForm } from '@/routes/auth/_components/forgot-password-form'

import type { Route } from './+types/forgot-password'

export const meta: Route.MetaFunction = () =>
  createMetadata({
    title: 'Forgot Password',
    description: 'Reset your password by entering your email address.',
  })

export default function ForgotPasswordPage() {
  return (
    <>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>

      <ForgotPasswordForm />
    </>
  )
}
