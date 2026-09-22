import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@rozumari/ui/components/card'
import { useSearchParams } from 'react-router'

import { createMetadata } from '@/lib/metadata'
import { ExchangeCard } from '@/routes/auth/_components/exchange-card'
import { LoginForm } from '@/routes/auth/_components/login-form'

import type { Route } from './+types/login'

export const meta: Route.MetaFunction = () =>
  createMetadata({
    title: 'Login',
    description: 'Login to your account to access all features.',
  })

export default function LoginPage() {
  const [searchParams] = useSearchParams()

  const token = searchParams.get('refresh_token')
  if (token)
    return (
      <CardHeader>
        <CardTitle>Almost there!</CardTitle>
        <CardDescription>
          Authenticating your details and taking you in...
        </CardDescription>

        <ExchangeCard token={token} />
      </CardHeader>
    )

  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>

      <LoginForm />
    </>
  )
}
