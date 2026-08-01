import * as Layer from 'effect/Layer'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'
import * as HttpServer from 'effect/unstable/http/HttpServer'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'
import * as HttpApiScalar from 'effect/unstable/httpapi/HttpApiScalar'

import { Api } from '@/api'
import { HomeModule } from '@/modules/home/home.module'
import { UserModule } from '@/modules/user/user.module'
import { env } from '@/shared/env'

export class AppModule {
  public static create(config: AppModule.Config) {
    const homeModule = HomeModule.create()

    const userModule = UserModule.create(config)

    const ApiLive = Layer.provide(
      HttpApiBuilder.layer(Api, { openapiPath: '/openapi.json' }),
      [
        homeModule.layer,
        userModule.layer,

        HttpRouter.add(
          '*',
          '*',
          HttpServerResponse.json(
            {
              status: 404,
              message: 'The requested resource was not found',
              data: null,
              error: null,
              timestamp: new Date(),
            },
            { status: 404 }
          )
        ),

        HttpRouter.cors({
          allowedOrigins: env.CORS_ORIGIN,
          allowedHeaders: [
            'content-type',
            'authorization',
            'x-requested-with',
            'b3',
            'traceparent',
          ],
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          credentials: true,
        }),
      ]
    )

    const DocsLive = HttpApiScalar.layer(Api, {
      path: '/docs',
      scalar: { theme: 'kepler' },
    })

    return Layer.mergeAll(ApiLive, DocsLive).pipe(
      Layer.provide(HttpServer.layerServices)
    )
  }
}

export namespace AppModule {
  export interface Config {
    persistentDriver: 'in-memory' | 'drizzle'
  }
}
