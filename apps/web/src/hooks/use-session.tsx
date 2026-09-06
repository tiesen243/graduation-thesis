import type { UserSchema } from '@rozumari/contract/user/schemas/user.schema'

import { toast } from '@rozumari/ui/components/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { useNavigate } from 'react-router'

import { api } from '@/lib/runtime'

type SessionContextValue = (
  | { status: 'loading'; user: UserSchema | null }
  | { status: 'authenticated'; user: UserSchema }
  | { status: 'unauthenticated'; user: null }
) & { logout: () => void; refetch: () => Promise<void> }

const SessionContext = React.createContext<SessionContextValue | null>(null)

const useSession = () => {
  const context = React.use(SessionContext)
  if (!context)
    throw new Error('useSession must be used within a SessionProvider')
  return context
}

function SessionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, refetch } = useQuery({
    ...api.auth.whoami.queryOptions(),
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { mutate: logout } = useMutation({
    ...api.auth.logout.mutationOptions({ headers: {} }),
    onSettled: () =>
      queryClient.setQueryData(api.auth.whoami.getQueryKey(), { data: null }),
    onSuccess: () => navigate('/login', { replace: true }),
    onError: ({ message }) =>
      toast.add({
        type: 'error',
        title: 'Logout failed',
        description: message,
      }),
  })

  const memoizedValue = React.useMemo(() => {
    const base = { logout, refetch }
    if (isLoading) return { ...base, status: 'loading', user: null } as never
    if (data?.data)
      return { ...base, status: 'authenticated', user: data.data } as never
    return { ...base, status: 'unauthenticated', user: null } as never
  }, [isLoading, data, logout, refetch])

  return <SessionContext value={memoizedValue}>{children}</SessionContext>
}

export { SessionProvider, useSession }
