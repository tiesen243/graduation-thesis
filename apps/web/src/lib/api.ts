// oxlint-disable-next-line no-unused-vars
import type { NodeInspectSymbol } from 'effect/Inspectable'

import { createTanstackQueryOptionsProxy } from '@tiesen/effect-tanstack-query'

import { ApiClient } from '@/lib/api.client'
import { runtime } from '@/lib/runtime'

export const api = createTanstackQueryOptionsProxy(ApiClient, runtime)
