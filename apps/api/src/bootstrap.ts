import type { AnyElysia } from 'elysia'
import type { ElysiaConfig, EventScope } from 'elysia/types'

import * as Layer from 'effect/Layer'
import { Elysia } from 'elysia'

import { AuthModule } from '@/modules/auth/auth.module'
import { UserModule } from '@/modules/user/user.module'
import { InfrastructureModule } from '@/shared/infrastructure/infratructure.module'

export class Bootstrap {
  public static create<TPrefix extends string, TScope extends EventScope>(
    config: Bootstrap.Config & {
      elysia: ElysiaConfig<TPrefix, TScope>
    }
  ) {
    const infrastructureModule = InfrastructureModule.create(
      config.persistenceDriver
    )

    const userModule = UserModule.create(
      config.persistenceDriver,
      Layer.provide(infrastructureModule.persistenceModule as never)
    )

    const authModule = AuthModule.create(
      config.persistenceDriver,
      Layer.provideMerge(
        Layer.merge(
          infrastructureModule.persistenceModule as never,
          userModule.exports.userService
        )
      )
    )

    return new Elysia({
      name: 'bootstrap',
      precompile: true,
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
