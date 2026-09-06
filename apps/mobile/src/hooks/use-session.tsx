import type { UserSchema } from '@rozumari/contract/user/schemas/user.schema'

import { toast } from '@rozumari/ui/components/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import * as React from 'react'

import { useRuntime } from '@/hooks/use-runtime'
import { clearTokens } from '@/lib/secure-store'

type SessionContextValue = (
  | { status: 'loading'; user: UserSchema | null }
  | { status: 'authenticated'; user: UserSchema }
  | { status: 'unauthenticated'; user: null }
) & { logout: () => void; refetch: () => Promise<void>; isRefetching: boolean }

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
  const { api } = useRuntime()

  const queryClient = useQueryClient()
  const router = useRouter()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    ...api.auth.whoami.queryOptions(),
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { mutate: logout } = useMutation({
    ...api.auth.logout.mutationOptions({ headers: {} }),
    onSettled: async () => {
      await clearTokens()
      queryClient.setQueryData(api.auth.whoami.getQueryKey(), { data: null })
    },
    onSuccess: () => router.replace('/(auth)/login'),
    onError: ({ message }) => toast.error('Logout failed', message),
  })

  const memoizedValue = React.useMemo(() => {
    const base = { logout, refetch, isRefetching }
    if (isLoading) return { ...base, status: 'loading', user: null } as never
    if (data?.data)
      return { ...base, status: 'authenticated', user: data.data } as never
    return { ...base, status: 'unauthenticated', user: null } as never
  }, [isLoading, data, logout, refetch, isRefetching])

  return <SessionContext value={memoizedValue}>{children}</SessionContext>
}

export { SessionProvider, useSession }
