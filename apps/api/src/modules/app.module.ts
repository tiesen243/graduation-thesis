import { Api } from '@rozumari/contract'
import * as Layer from 'effect/Layer'
import * as Command from 'effect/unstable/cli/Command'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'
import * as HttpApiScalar from 'effect/unstable/httpapi/HttpApiScalar'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import type { BaseProvider } from '@/modules/auth/infrastructure/services/providers/base.provider'

import { AuthModule } from '@/modules/auth/auth.module'
import { DeviceModule } from '@/modules/device/device.module'
import { HomeModule } from '@/modules/home/home.module'
import { NotificationModule } from '@/modules/notification/notification.module'
import { ScheduleModule } from '@/modules/schedule/schedule.module'
import { UserModule } from '@/modules/user/user.module'
import { InfrastructureModule } from '@/shared/infrastructure/infrastructure.module'

import * as pkgJson from '../../package.json' with { type: 'json' }

export class AppModule {
  public static create(config: AppModule.Config) {
    const { persistence, providers } = config

    const infrastructureLayer = InfrastructureModule.create(persistence)

    const homeModule = HomeModule.create()
    const deviceModule = DeviceModule.create({ persistence })
    const notificationModule = NotificationModule.create(
      { persistence },
      deviceModule.exports.deviceService
    )
    const scheduleModule = ScheduleModule.create({ persistence })
    const userModule = UserModule.create({ persistence })
    const authModule = AuthModule.create(
      { persistence, providers },
      userModule.exports.userService
    )

    const controllerLayer = Layer.mergeAll(
      homeModule.controller,
      deviceModule.controller,
      notificationModule.controller,
      scheduleModule.controller,
      userModule.controller,
      authModule.controller
    ).pipe(
      Layer.provide([
        authModule.exports.middleware,
        deviceModule.exports.middleware,
      ]),
      Layer.provide(infrastructureLayer)
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
        Command.withSubcommands([deviceModule.command, userModule.command]),
        Command.provide(infrastructureLayer)
      ),
      { version: pkgJson.version }
    )

    return { routes, cli }
  }
}

export namespace AppModule {
  export interface Config {
    persistence: 'in-memory' | 'drizzle'

    providers: BaseProvider[]
  }
}
