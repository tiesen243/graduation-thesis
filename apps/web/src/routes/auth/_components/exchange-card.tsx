import { RefreshToken } from '@rozumari/contract/auth/schemas/token.schema'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { Loader2Icon } from '@rozumari/ui/components/icons'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

import { api } from '@/lib/runtime'
import { useSession } from '@/lib/use-session'

export const ExchangeCard: React.FC<{ token: string }> = ({ token }) => {
  const navigate = useNavigate()
  const handledRef = useRef(false)

  const { refetch } = useSession()

  const exchange = useMutation({
    ...api.oauth.exchange.mutationOptions(),
    onSuccess: async () => {
      await refetch()

      navigate('/dashboard', { replace: true })
    },
    onError: ({ message }) =>
      toast.add({ type: 'error', title: 'OAuth failed', description: message }),
  })

  useEffect(() => {
    if (!handledRef.current) {
      handledRef.current = true
      exchange.mutate({ token: RefreshToken.make(token) })
    }
  }, [exchange, token])

  return (
    <CardHeader>
      <CardTitle>Almost there!</CardTitle>
      <CardDescription>
        Authenticating your details and taking you in...
      </CardDescription>

      <CardContent className='flex items-center justify-center py-6'>
        <Loader2Icon className='size-8 animate-spin' />
      </CardContent>
    </CardHeader>
  )
}
