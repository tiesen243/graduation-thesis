import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { UserRepository } from '@/modules/user/application/ports/user.repository'

import { DrizzleUserRepository } from '@/modules/user/infrastructure/persistence/drizzle/repositories/user.repository'
import { InMemoryUserRepository } from '@/modules/user/infrastructure/persistence/in-memory/repositories/user.repository'
import { UserServiceLayer } from '@/modules/user/infrastructure/services/user.service'

export class UserInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const infrasLayer = driver === 'in-memory' ? this.inMemory : this.drizzle

    const serviceLayer = UserServiceLayer

    return Layer.provideMerge(serviceLayer, infrasLayer)
  }

  private static get inMemory(): Layer.Layer<UserRepository> {
    return InMemoryUserRepository as never
  }

  private static get drizzle(): Layer.Layer<UserRepository> {
    return DrizzleUserRepository as never
  }
}
