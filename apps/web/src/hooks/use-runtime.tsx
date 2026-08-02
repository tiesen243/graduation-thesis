import type { TanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'

import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import * as React from 'react'

import type { IApiClient } from '@/lib/api-client'

import { ApiClient, ApiClientLayer } from '@/lib/api-client'

const appLayer = Layer.mergeAll(ApiClientLayer)

interface RuntimeContextValue {
  runtime: ManagedRuntime.ManagedRuntime<Layer.Success<typeof appLayer>, never>
  api: TanstackQueryOptionsProxy<IApiClient>
}

export const RuntimeContext = React.createContext<RuntimeContextValue | null>(
  null
)

export function useRuntime() {
  const context = React.use(RuntimeContext)
  if (!context)
    throw new Error('useRuntime must be used within a RuntimeProvider')
  return context
}

export function RuntimeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [runtime] = React.useState(() => ManagedRuntime.make(appLayer))
  const [api] = React.useState(() =>
    createTanstackQueryOptionsProxy(ApiClient, runtime)
  )

  const value = React.useMemo(() => ({ runtime, api }), [runtime, api])

  return <RuntimeContext value={value}>{children}</RuntimeContext>
}
