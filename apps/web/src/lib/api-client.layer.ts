import { AuthMiddleware } from '@rozumari/api'
import * as Layer from 'effect/Layer'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import * as HttpApiMiddleware from 'effect/unstable/httpapi/HttpApiMiddleware'

import { ApiClient } from '@/lib/api-client'

const AuthMiddlewareClient = HttpApiMiddleware.layerClient(
  AuthMiddleware,
  ({ next, request }) => next(request)
)

export const ApiClientLayer = Layer.effect(ApiClient, ApiClient.make).pipe(
  Layer.provide(AuthMiddlewareClient),
  Layer.provide(
    FetchHttpClient.layer.pipe(
      Layer.provide(
        Layer.succeed(FetchHttpClient.RequestInit, { credentials: 'include' })
      )
    )
  )
)
