import * as BunServices from '@effect/platform-bun/BunServices'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as References from 'effect/References'
import * as Etag from 'effect/unstable/http/Etag'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'
import * as HttpServerRequest from 'effect/unstable/http/HttpServerRequest'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'

import { AppModule } from '@/modules/app.module'
import { GoogleProvider } from '@/modules/auth/infrastructure/oauth/providers/google.provider'
import { env } from '@/shared/env'

function bootstrap() {
  const { routes } = AppModule.create({
    persistence: 'drizzle',
    auth: {
      secret: env.AUTH_SECRET,
      providers: [
        new GoogleProvider(env.AUTH_GOOGLE_ID, env.AUTH_GOOGLE_SECRET),
      ],
    },
  })

  const program = Effect.fn(function* program(_request: Request) {
    const httpEffect = yield* HttpRouter.toHttpEffect(
      routes.pipe(
        Layer.provide([Etag.layer, BunServices.layer]),
        Layer.provide(
          HttpRouter.cors({
            allowedOrigins: env.CORS_ORIGIN,
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
              'Content-Type',
              'Authorization',
              'X-Requested-With',
              'b3',
              'traceparent',
            ],
            credentials: true,
          })
        ),
        Layer.provide([
          Layer.succeed(
            References.MinimumLogLevel,
            env.NODE_ENV === 'production' ? 'Info' : 'Debug'
          ),
          Layer.succeed(DateTime.CurrentTimeZone, env.TIMEZONE),
        ])
      )
    )

    const request = HttpServerRequest.fromWeb(_request)

    const response = yield* httpEffect.pipe(
      Effect.provideService(HttpServerRequest.HttpServerRequest, request),

      Effect.tap((res) =>
        Effect.log({
          'http.status': res.status,
          'http.method': request.method,
          'http.url': request.url,
          'http.cookies': res.cookies,
        }).pipe(Effect.withLogSpan('HttpServerResponse'))
      ),

      Effect.catchReason('HttpServerError', 'RouteNotFound', (reason) =>
        HttpServerResponse.json(
          {
            status: 404,
            message: 'The requested route was not found.',
            data: null,
            error: reason.cause,
            timestamp: new Date(),
          },
          { status: 404 }
        )
      )
    )

    yield* Effect.log(response.cookies)
    return HttpServerResponse.toWeb(response)
  })

  return {
    fetch: (request: Request) =>
      Effect.runPromise(
        program(request).pipe(Effect.scoped) as Effect.Effect<Response>
      ),
  }
}

export default bootstrap()
