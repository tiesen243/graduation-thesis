import * as Layer from 'effect/Layer'

import { ApiClientLayer } from '@/lib/api-client.layer'

export const appLayer = Layer.mergeAll(ApiClientLayer)
