import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'

import { ApiClient } from '@/lib/api.client'

const appLayer = Layer.mergeAll(ApiClient.live)
export const runtime = ManagedRuntime.make(appLayer)
