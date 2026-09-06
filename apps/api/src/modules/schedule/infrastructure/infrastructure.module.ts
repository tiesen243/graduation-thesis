import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import type { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'

import { DrizzleScheduleItemRepository } from '@/modules/schedule/infrastructure/persistence/drizzle/repositories/schedule-item.repository'
import { DrizzleScheduleRepository } from '@/modules/schedule/infrastructure/persistence/drizzle/repositories/schedule.repository'
import { InMemoryScheduleItemRepository } from '@/modules/schedule/infrastructure/persistence/in-memory/repositories/schedule-item.repository'
import { InMemoryScheduleRepository } from '@/modules/schedule/infrastructure/persistence/in-memory/repositories/schedule.repository'

export class ScheduleInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const infrasLayer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return infrasLayer
  }

  private static get inMemory(): Layer.Layer<
    ScheduleItemRepository | ScheduleRepository
  > {
    return Layer.merge(
      InMemoryScheduleItemRepository,
      InMemoryScheduleRepository
    ) as never
  }

  private static get drizzle(): Layer.Layer<
    ScheduleItemRepository | ScheduleRepository
  > {
    return Layer.merge(
      DrizzleScheduleRepository,
      DrizzleScheduleItemRepository
    ) as never
  }
}
