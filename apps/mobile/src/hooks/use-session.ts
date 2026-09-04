import type { UserSchema } from '@rozumari/contract/user/schemas/user.schema'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'

import { useRuntime } from '@/hooks/use-runtime'
import { clearTokens } from '@/lib/secure-store'

type UseSessionReturn = (
  | { status: 'loading'; user: UserSchema | null }
  | { status: 'authenticated'; user: UserSchema }
  | { status: 'unauthenticated'; user: null }
) & { logout: () => void; refetch: () => Promise<void> }

export const useSession = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { api } = useRuntime()

  const { data, isLoading, refetch } = useQuery({
    ...api.auth.whoami.queryOptions(),
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { mutate: logout } = useMutation({
    ...api.auth.logout.mutationOptions({ headers: {} }),
    onSettled: async () => {
      await queryClient.setQueryData(api.auth.whoami.getQueryKey(), {
        data: null,
      })
      await clearTokens()
    },
    onSuccess: () => router.navigate('/login'),
  })

  return useMemo(() => {
    if (isLoading) return { status: 'loading', user: null, logout, refetch }
    if (data?.data)
      return { status: 'authenticated', user: data.data, logout, refetch }
    return { status: 'unauthenticated', user: null, logout, refetch }
  }, [isLoading, data, logout, refetch]) as unknown as UseSessionReturn
}
