import * as BunCrypto from '@effect/platform-bun/BunCrypto'
import * as BunFileSystem from '@effect/platform-bun/BunFileSystem'
import * as BunHttpPlatform from '@effect/platform-bun/BunHttpPlatform'
import * as BunPath from '@effect/platform-bun/BunPath'
import * as DateTime from 'effect/DateTime'
import * as Layer from 'effect/Layer'
import * as References from 'effect/References'
import * as Etag from 'effect/unstable/http/Etag'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'

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
      Etag.layer,

      BunHttpPlatform.layer,
      BunFileSystem.layer,
      BunCrypto.layer,
      BunPath.layer,
    ])
  )

  return handler as (request: Request) => Promise<Response>
}

Bun.serve({
  port: env.PORT,

  fetch: bootstrap(),

  development: env.NODE_ENV === 'development' && {
    hmr: true,
    console: true,
  },
})
