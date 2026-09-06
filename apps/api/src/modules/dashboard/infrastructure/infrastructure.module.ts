import type * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { DashboardRepository } from '@/modules/dashboard/application/ports/dashboard.repository'

import { DrizzleDashboardRepository } from '@/modules/dashboard/infrastructure/persistence/drizzle/repositories/dashboard.repository'
import { InMemoryDashboardRepository } from '@/modules/dashboard/infrastructure/persistence/in-memory/repositories/dashboard.repository'

export class DashboardInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const infrasLayer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return infrasLayer
  }

  private static get inMemory(): Layer.Layer<DashboardRepository> {
    return InMemoryDashboardRepository as never
  }

  private static get drizzle(): Layer.Layer<DashboardRepository> {
    return DrizzleDashboardRepository as never
  }
}
