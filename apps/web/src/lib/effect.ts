import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'

import { ApiClient } from '@/lib/api-client'
import { ApiClientLayer } from '@/lib/api-client.layer'

const appLayer = Layer.mergeAll(ApiClientLayer)

export const runtime = ManagedRuntime.make(appLayer)
export const api = createTanstackQueryOptionsProxy(ApiClient, runtime)
