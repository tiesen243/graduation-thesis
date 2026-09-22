// oxlint-disable react/hook-use-state

import type { TanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'

import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'
import * as DateTime from 'effect/DateTime'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { getCalendars } from 'expo-localization'
import * as React from 'react'

import { ApiClient } from '@/lib/api-client'
import { ApiClientLayer } from '@/lib/api-client.layer'

const [{ timeZone }] = getCalendars()
const appLayer = Layer.mergeAll(
  ApiClientLayer,
  DateTime.layerCurrentZone(DateTime.zoneMakeNamedUnsafe(timeZone ?? 'UTC'))
)

const RuntimeContext = React.createContext<{
  runtime: ManagedRuntime.ManagedRuntime<
    ApiClient | DateTime.CurrentTimeZone,
    never
  >
  api: TanstackQueryOptionsProxy<ApiClient['Service']>
} | null>(null)

const useRuntime = () => {
  const context = React.use(RuntimeContext)
  if (!context)
    throw new Error('useRuntime must be used within a RuntimeProvider')
  return context
}

function RuntimeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [runtime] = React.useState(() => ManagedRuntime.make(appLayer))
  const [api] = React.useState(() =>
    createTanstackQueryOptionsProxy(ApiClient, runtime)
  )

  const memoizedValue = React.useMemo(() => ({ runtime, api }), [runtime, api])

  return <RuntimeContext value={memoizedValue}>{children}</RuntimeContext>
}

export { RuntimeProvider, useRuntime }
