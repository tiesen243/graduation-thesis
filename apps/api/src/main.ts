import * as BunHttpServer from '@effect/platform-bun/BunHttpServer'
import * as BunRuntime from '@effect/platform-bun/BunRuntime'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as References from 'effect/References'
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

  routes.pipe(
    Layer.provide(
      HttpRouter.cors({
        allowedOrigins: env.CORS_ORIGIN,
        credentials: true,
      })
    ),
    HttpRouter.serve,
    Layer.provide(BunHttpServer.layer({ port: env.PORT })),
    Layer.launch as (self: Layer.Any) => Effect.Effect<never, unknown>,
    Effect.provideService(
      References.MinimumLogLevel,
      env.NODE_ENV === 'production' ? 'Info' : 'Debug'
    ),
    BunRuntime.runMain
  )
}

bootstrap()
