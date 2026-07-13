import type { AnyElysia } from 'elysia'
import type { ElysiaConfig, EventScope } from 'elysia/types'

import * as Layer from 'effect/Layer'
import { Elysia } from 'elysia'

import { AuthModule } from '@/modules/auth/auth.module'
import { UserModule } from '@/modules/user/user.module'
import { InfrastructureModule } from '@/shared/infrastructure/infratructure.module'

export class Bootstrap {
  public static create<TPrefix extends string = ''>(
    config: Bootstrap.Config & {
      elysia: ElysiaConfig<TPrefix, EventScope>
    }
  ) {
    const infrastructureModule = InfrastructureModule.create(
      config.persistenceDriver
    )

    const userModule = UserModule.create(
      config.persistenceDriver,
      infrastructureModule.persistenceModule
    )

    const authModule = AuthModule.create(
      config.persistenceDriver,
      Layer.mergeAll(
        infrastructureModule.persistenceModule,
        userModule.exports.userService
      )
    )

    return new Elysia({
      name: 'bootstrap',
      ...config.elysia,
    })

      .use(config.plugins)

      .use(userModule.controller)
      .use(authModule.controller)

      .compile()
  }
}

export namespace Bootstrap {
  export interface Config {
    persistenceDriver: 'in-memory' | 'drizzle'
    plugins: AnyElysia[]
  }
}
