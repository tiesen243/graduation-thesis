import { AuthMiddleware } from '@rozumari/contract/auth/middleware'
import * as Effect from 'effect/Effect'
import * as HttpApiMiddleware from 'effect/http-api/HttpApiMiddleware'
import * as FetchHttpClient from 'effect/http/FetchHttpClient'
import * as HttpClientRequest from 'effect/http/HttpClientRequest'
import * as Layer from 'effect/Layer'

import { ApiClient } from '@/lib/api-client'
import { getTokens } from '@/lib/secure-store'

const AuthMiddlewareClient = HttpApiMiddleware.layerClient(
  AuthMiddleware,
  Effect.fn(function* AuthMiddlewareClient({ next, request }) {
    const { accessToken } = yield* Effect.promise(getTokens)
    if (!accessToken) return yield* next(request)

    return yield* next(HttpClientRequest.bearerToken(request, accessToken))
  })
)

export const ApiClientLayer = Layer.effect(ApiClient, ApiClient.make).pipe(
  Layer.provide(AuthMiddlewareClient),
  Layer.provide(FetchHttpClient.layer)
)
