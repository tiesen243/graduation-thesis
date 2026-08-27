import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { DrizzleNotificationRepository } from '@/modules/notification/infrastructure/persistence/drizzle/repositories/notification.repository'
import { InMemoryNotificationRepository } from '@/modules/notification/infrastructure/persistence/in-memory/repositories/notification.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export class NotificationInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const layer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return Layer.mergeAll(layer)
  }

  private static get inMemory() {
    return InMemoryNotificationRepository.pipe(
      Layer.provideMerge(InMemoryClient.layer)
    )
  }

  private static get drizzle() {
    return DrizzleNotificationRepository.pipe(
      Layer.provideMerge(DrizzleClient.layer)
    )
  }
}
