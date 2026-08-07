import { useSearchParams } from 'react-router'

import { ExchangeCard } from '@/routes/auth/_components/exchange-card'
import { LoginForm } from '@/routes/auth/_components/login-form'

export default function LoginPage() {
  const [searchParams] = useSearchParams()

  const token = searchParams.get('refresh_token')
  if (token) return <ExchangeCard token={token} />

  return <LoginForm />
}
