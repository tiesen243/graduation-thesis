import type { AnyElysia } from 'elysia'
import type { ElysiaConfig, EventScope } from 'elysia/types'

import { Elysia } from 'elysia'

import type { BaseProvider } from '@/modules/auth/infrastructure/oauth/providers/base.provider'

import { AuthModule } from '@/modules/auth/auth.module'
import { UserModule } from '@/modules/user/user.module'

export class Bootstrap {
  public static create<TPrefix extends string = ''>(
    config: Bootstrap.Config & {
      elysia: ElysiaConfig<TPrefix, EventScope>
    }
  ) {
    const userModule = UserModule.create(config.persistenceDriver)

    const authModule = AuthModule.create(
      config.persistenceDriver,
      config.providers,
      userModule.exports.userService
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
    providers: BaseProvider[]
    plugins: AnyElysia[]
  }
}
