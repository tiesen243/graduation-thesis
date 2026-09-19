import * as BunHttpPlatform from '@effect/platform-bun/BunHttpPlatform'
import * as BunServices from '@effect/platform-bun/BunServices'
import * as DateTime from 'effect/DateTime'
import * as Layer from 'effect/Layer'
import * as References from 'effect/References'
import * as Etag from 'effect/unstable/http/Etag'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'

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

const { handler } = HttpRouter.toWebHandler(
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
    Etag.layer,
  ])
)

// const program = Effect.gen(function* program() {
//   const httpEffect = yield* handler
//
//   const context = yield* Effect.context()
//   const webResponse = yield* Deferred.make<Response>()
//
//   yield* HttpEffect.toHandled(httpEffect, (request, response) =>
//     Deferred.succeed(
//       webResponse,
//       HttpServerResponse.toWeb(HttpEffect.scopeTransferToStream(response), {
//         withoutBody: request.method === 'HEAD',
//         context,
//       })
//     )
//   )
//
//   return yield* Deferred.await(webResponse)
// }).pipe(Effect.scoped)

export default {
  fetch: handler,
  // fetch: (request: Request) =>
  //   Effect.runPromise(
  //     Effect.provideService(
  //       program,
  //       HttpServerRequest.HttpServerRequest,
  //       HttpServerRequest.fromWeb(request)
  //     ) as Effect.Effect<Response>
  //   ),
}
