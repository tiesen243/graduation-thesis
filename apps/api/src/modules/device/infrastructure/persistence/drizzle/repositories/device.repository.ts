import type { DeviceSchema } from '@rozumari/contract/device/schemas/device.schema'

import {
  DeviceId,
  DeviceStatus,
} from '@rozumari/contract/device/schemas/device.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Device } from '@/modules/device/domain/entities/device.entity'
import { DeviceRepository } from '@/modules/device/domain/repositories/device.repository'
import { devices } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleDeviceMapper = {
  toEntity: (entity: typeof DeviceSchema.Type) =>
    Device.make({
      ...entity,
      id: DeviceId.make(entity.id),
      status: DeviceStatus.make(entity.status),
    }),
  toRow: structuredClone,
}

export const DrizzleDeviceRepository = Layer.effect(
  DeviceRepository,
  Effect.gen(function* DrizzleDeviceRepository() {
    const repository = yield* makeDrizzleRepository(
      devices,
      devices.id,
      DrizzleDeviceMapper
    )

    return {
      ...repository,
    }
  })
)
