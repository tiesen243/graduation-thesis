import * as BunHttpPlatform from '@effect/platform-bun/BunHttpPlatform'
import * as BunServices from '@effect/platform-bun/BunServices'
import { NotFound } from '@rozumari/contract/home/schemas/home.error'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as References from 'effect/References'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'
import * as HttpServerRequest from 'effect/unstable/http/HttpServerRequest'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'

import { AppModule } from '@/modules/app.module'
import { FacebookProvider } from '@/modules/auth/infrastructure/services/providers/facebook.provider'
import { GoogleProvider } from '@/modules/auth/infrastructure/services/providers/google.provider'
import { env } from '@/shared/env'

const routes = AppModule.createHttp({
  persistence: 'drizzle',
  providers: [
    new FacebookProvider(env.AUTH_FACEBOOK_ID, env.AUTH_FACEBOOK_SECRET),
    new GoogleProvider(env.AUTH_GOOGLE_ID, env.AUTH_GOOGLE_SECRET),
  ],
})

const httpEffect = HttpRouter.toHttpEffect(
  Layer.provide(routes, [
    HttpRouter.cors({
      allowedOrigins:
        env.VERCEL_ENV === 'preview' && env.VERCEL_BRANCH_URL
          ? [`https://${env.VERCEL_BRANCH_URL.replace('-api-git-', '-git-')}`]
          : env.CORS_ORIGIN,
      allowedMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'content-type',
        'authorization',
        'x-requested-with',
        'x-vercel-protection-bypass',

        'b3',
        'traceparent',
      ],
      credentials: true,
    }),

    Layer.succeed(DateTime.CurrentTimeZone, env.TIMEZONE),
    Layer.succeed(
      References.MinimumLogLevel,
      env.NODE_ENV === 'development' ? 'Debug' : 'Info'
    ),

    BunHttpPlatform.layer,
    BunServices.layer,
  ])
)

export default {
  fetch: (request: Request) =>
    Effect.runPromise(
      httpEffect.pipe(
        Effect.flatMap((_httpEffect) => _httpEffect),
        Effect.catchReason('HttpServerError', 'RouteNotFound', () =>
          HttpServerResponse.json(new NotFound(), { status: 404 })
        ),
        Effect.map((httpResponse) => HttpServerResponse.toWeb(httpResponse)),
        Effect.provideService(
          HttpServerRequest.HttpServerRequest,
          HttpServerRequest.fromWeb(request)
        ),
        Effect.scoped
      ) as Effect.Effect<Response>
    ),
}
