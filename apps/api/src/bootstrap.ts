import * as DateTime from 'effect/DateTime'
import * as HttpRouter from 'effect/http/HttpRouter'
import * as HttpServer from 'effect/http/HttpServer'
import * as Layer from 'effect/Layer'
import * as References from 'effect/References'

import { AppModule } from '@/modules/app.module'
import { FacebookProvider } from '@/modules/auth/infrastructure/services/providers/facebook.provider'
import { GithubProvider } from '@/modules/auth/infrastructure/services/providers/github.provider'
import { GoogleProvider } from '@/modules/auth/infrastructure/services/providers/google.provider'
import { TwitterProvider } from '@/modules/auth/infrastructure/services/providers/twitter.provider'
import * as Crypto from '@/shared/crypto'
import { env } from '@/shared/env'

const routes = AppModule.createHttp({
  persistence: 'drizzle',
  providers: [
    new FacebookProvider(env.AUTH_FACEBOOK_ID, env.AUTH_FACEBOOK_SECRET),
    new GithubProvider(env.AUTH_GITHUB_ID, env.AUTH_GITHUB_SECRET),
    new GoogleProvider(env.AUTH_GOOGLE_ID, env.AUTH_GOOGLE_SECRET),
    new TwitterProvider(env.AUTH_TWITTER_ID, env.AUTH_TWITTER_SECRET),
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
    Layer.succeed(References.TracerEnabled, false),

    HttpServer.layerServices,
    Crypto.layer,
  ]),
  { disableLogger: true }
)

export default {
  fetch: (request, server) => {
    const url = new URL(request.url)
    if (url.pathname === '/ws') {
      const topic = url.searchParams.get('topic') ?? 'default'
      const success = server.upgrade(request, {
        data: { topic },
      })

      if (!success)
        return new Response('WebSocket upgrade failed', { status: 400 })
    }

    return handler(request, {} as never)
  },

  websocket: {
    open: (ws) => {
      const { topic } = ws.data
      ws.subscribe(topic)
    },
    message: (ws, message) => {
      const { topic } = ws.data
      ws.publish(topic, message)
    },
    close: (ws, _code, _reason) => {
      const { topic } = ws.data
      ws.unsubscribe(topic)
    },
  },
} satisfies Bun.Serve.Options<{ topic: string }>
