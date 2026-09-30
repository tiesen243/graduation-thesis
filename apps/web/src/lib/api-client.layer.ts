import { AuthMiddleware } from '@rozumari/contract/auth/middleware'
import * as HttpApiMiddleware from 'effect/http-api/HttpApiMiddleware'
import * as FetchHttpClient from 'effect/http/FetchHttpClient'
import * as Layer from 'effect/Layer'

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
