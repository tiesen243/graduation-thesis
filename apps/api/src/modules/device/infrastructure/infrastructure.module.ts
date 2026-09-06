import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { CompartmentRepository } from '@/modules/device/application/ports/compartment.repository'
import type { DeviceRepository } from '@/modules/device/application/ports/device.repository'

import { DrizzleCompartmentRepository } from '@/modules/device/infrastructure/persistence/drizzle/repositories/compartment.repository'
import { DrizzleDeviceRepository } from '@/modules/device/infrastructure/persistence/drizzle/repositories/device.repository'
import { InMemoryCompartmentRepository } from '@/modules/device/infrastructure/persistence/in-memory/repositories/compartment.repository'
import { InMemoryDeviceRepository } from '@/modules/device/infrastructure/persistence/in-memory/repositories/device.repository'
import { DeviceServiceLayer } from '@/modules/device/infrastructure/services/device.service'

export class DeviceInfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const infrasLayer = driver === 'in-memory' ? this.inMemory : this.drizzle

    const serviceLayer = DeviceServiceLayer

    return Layer.provideMerge(serviceLayer, infrasLayer)
  }

  private static get inMemory(): Layer.Layer<
    CompartmentRepository | DeviceRepository
  > {
    return Layer.mergeAll(
      InMemoryCompartmentRepository,
      InMemoryDeviceRepository
    ) as never
  }

  private static get drizzle(): Layer.Layer<
    CompartmentRepository | DeviceRepository
  > {
    return Layer.mergeAll(
      DrizzleCompartmentRepository,
      DrizzleDeviceRepository
    ) as never
  }
}
