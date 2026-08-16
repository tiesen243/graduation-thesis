import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { api } from '@/lib/runtime'

export const useDevice = () => {
  const params = useParams<{ id: DeviceId }>()
  if (!params.id) throw new Error('Device ID is required')

  const { data, error, isLoading } = useQuery(
    api.device.show.queryOptions({ params: { id: params.id } })
  )

  return { device: data?.data, error, isLoading }
}
