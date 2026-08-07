import * as DateTime from 'effect/DateTime'
import * as Layer from 'effect/Layer'
import * as References from 'effect/References'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'
import * as HttpServer from 'effect/unstable/http/HttpServer'

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

  const { handler } = HttpRouter.toWebHandler(
    Layer.provide(routes, [
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
      }),
      Layer.succeed(
        References.MinimumLogLevel,
        env.NODE_ENV === 'production' ? 'Info' : 'Debug'
      ),
      Layer.succeed(DateTime.CurrentTimeZone, env.TIMEZONE),
      HttpServer.layerServices,
    ])
  )

  return { fetch: handler }
}

export default bootstrap()
