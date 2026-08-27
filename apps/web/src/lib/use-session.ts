import type { UserSchema } from '@rozumari/contract/user/schemas/user.schema'

import { toast } from '@rozumari/ui/components/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { api } from '@/lib/runtime'

type UseSessionReturn = (
  | { status: 'loading'; user: UserSchema | null }
  | { status: 'authenticated'; user: UserSchema }
  | { status: 'unauthenticated'; user: null }
) & { logout: () => void; refetch: () => Promise<void> }

export const useSession = () => {
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

  return useMemo(() => {
    if (isLoading) return { status: 'loading', user: null, logout, refetch }
    if (data?.data)
      return { status: 'authenticated', user: data.data, logout, refetch }
    return { status: 'unauthenticated', user: null, logout, refetch }
  }, [isLoading, data, logout, refetch]) as unknown as UseSessionReturn
}
