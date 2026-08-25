import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { DrizzleScheduleRepository } from '@/modules/schedule/infrastructure/persistence/drizzle/repositories/schedule.repository'
import { InMemoryScheduleRepository } from '@/modules/schedule/infrastructure/persistence/in-memory/repositories/schedule.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export class ScheduleInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const layer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return Layer.mergeAll(layer)
  }

  private static get inMemory() {
    return InMemoryScheduleRepository.pipe(Layer.provideMerge(InMemoryClient.layer))
  }

  private static get drizzle() {
    return DrizzleScheduleRepository.pipe(Layer.provideMerge(DrizzleClient.layer))
  }
}
