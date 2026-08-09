import type { UserSchema } from '@rozumari/contract/user/schemas/user.schema'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { api } from '@/lib/runtime'

type UseSessionReturn = (
  | { status: 'loading'; user: UserSchema | null }
  | { status: 'authenticated'; user: UserSchema }
  | { status: 'unauthenticated'; user: null }
) & { logout: () => void }

export const useSession = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    ...api.auth.whoami.queryOptions(),
    retry: 1,
  })

  const { mutate: logout } = useMutation({
    ...api.auth.logout.mutationOptions({ headers: {} }),
    onSettled: () =>
      queryClient.setQueryData(api.auth.whoami.getQueryKey(), { data: null }),
    onSuccess: () => navigate('/login', { replace: true }),
    onError: (e) => console.error(e),
  })

  return useMemo(() => {
    if (isLoading) return { status: 'loading', user: null, logout }
    if (data?.data) return { status: 'authenticated', user: data.data, logout }
    return { status: 'unauthenticated', user: null, logout }
  }, [isLoading, data, logout]) as UseSessionReturn
}
