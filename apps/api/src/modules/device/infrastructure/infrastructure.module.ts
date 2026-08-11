import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { DrizzleCompartmentRepository } from '@/modules/device/infrastructure/persistence/drizzle/repositories/compartment.repository'
import { DrizzleDeviceRepository } from '@/modules/device/infrastructure/persistence/drizzle/repositories/device.repository'
import { InMemoryCompartmentRepository } from '@/modules/device/infrastructure/persistence/in-memory/repositories/compartment.repository'
import { InMemoryDeviceRepository } from '@/modules/device/infrastructure/persistence/in-memory/repositories/device.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export class DeviceInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const layer = driver === 'in-memory' ? this.inMemory : this.drizzle

    return Layer.mergeAll(layer)
  }

  private static get inMemory() {
    return Layer.mergeAll(
      InMemoryDeviceRepository,
      InMemoryCompartmentRepository
    ).pipe(Layer.provideMerge(InMemoryClient.layer))
  }

  private static get drizzle() {
    return Layer.mergeAll(
      DrizzleDeviceRepository,
      DrizzleCompartmentRepository
    ).pipe(Layer.provideMerge(DrizzleClient.layer))
  }
}
