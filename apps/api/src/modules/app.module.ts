import { Api } from '@rozumari/contract'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Command from 'effect/unstable/cli/Command'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'
import * as HttpApiScalar from 'effect/unstable/httpapi/HttpApiScalar'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import type { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'

import { AuthModule } from '@/modules/auth/auth.module'
import { HomeModule } from '@/modules/home/home.module'
import { UserModule } from '@/modules/user/user.module'

import * as pkgJson from '../../package.json' with { type: 'json' }

export class AppModule {
  public static create(config: AppModule.Config) {
    const { persistence, auth } = config

    const homeModule = HomeModule.create()
    const userModule = UserModule.create({ persistence })
    const authModule = AuthModule.create(
      { persistence, auth },
      { userService: userModule.exports.services.userService }
    )

    const controllerLayer = Layer.mergeAll(
      homeModule.controller,
      userModule.controller,
      authModule.controller
    ).pipe(
      Layer.provide([
        authModule.exports.middlewares.auth,
        authModule.exports.middlewares.admin,
      ])
    )

    const apiLive = HttpApiBuilder.layer(Api, {
      openapiPath: '/openapi.json',
    }).pipe(Layer.provide(controllerLayer))

    const docsLive = HttpApiScalar.layer(
      Api.annotateMerge(
        OpenApi.annotations({
          title: pkgJson.name,
          version: pkgJson.version,
          license: {
            name: 'Apache-2.0',
            url: 'https://raw.githubusercontent.com/tiesen243/graduation-thesis/refs/heads/dev/LICENSE',
          },
        })
      ),
      { path: '/docs', scalar: { theme: 'kepler' } }
    )

    const routes = Layer.mergeAll(apiLive, docsLive)

    const cli = Command.run(
      Command.make(pkgJson.name).pipe(
        Command.withSubcommands([userModule.command])
      ),
      { version: pkgJson.version }
    ).pipe(Effect.provide([userModule.exports.layer]))

    return { routes, cli }
  }
}

export namespace AppModule {
  export interface Config {
    persistence: 'in-memory' | 'drizzle'

    auth: {
      secret: string
      providers: BaseProvider[]
    }
  }
}
