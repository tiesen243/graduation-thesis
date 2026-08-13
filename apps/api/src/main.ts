import * as BunCrypto from '@effect/platform-bun/BunCrypto'
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
        allowedOrigins:
          env.VERCEL_ENV === 'preview' && env.VERCEL_BRANCH_URL
            ? [`https://${env.VERCEL_BRANCH_URL.replace('-api-git-', '-git-')}`]
            : env.CORS_ORIGIN,
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
      Layer.succeed(
        References.MinimumLogLevel,
        env.NODE_ENV === 'production' ? 'Info' : 'Debug'
      ),
      Layer.succeed(DateTime.CurrentTimeZone, env.TIMEZONE),
      HttpServer.layerServices,
      BunCrypto.layer,
    ])
  )

  return { fetch: handler }
}

export default bootstrap()
