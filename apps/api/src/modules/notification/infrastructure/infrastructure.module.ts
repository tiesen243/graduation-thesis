import type * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { NotificationRepository } from '@/modules/notification/application/ports/notification.repository'

import { DrizzleNotificationRepository } from '@/modules/notification/infrastructure/persistence/drizzle/repositories/notification.repository'
import { InMemoryNotificationRepository } from '@/modules/notification/infrastructure/persistence/in-memory/repositories/notification.repository'

export class NotificationInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const infrasLayer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return infrasLayer
  }

  private static get inMemory(): Layer.Layer<NotificationRepository> {
    return InMemoryNotificationRepository as never
  }

  private static get drizzle(): Layer.Layer<NotificationRepository> {
    return DrizzleNotificationRepository as never
  }
}
