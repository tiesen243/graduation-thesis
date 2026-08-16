import type { DeviceSchema } from '@rozumari/contract/device/schemas/device.schema'

import {
  DeviceId,
  DeviceStatus,
} from '@rozumari/contract/device/schemas/device.schema'
import { eq, sql } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceCompartmentsAggregate } from '@/modules/device/domain/entities/device-compartments.aggregate'
import { Device } from '@/modules/device/domain/entities/device.entity'
import { DeviceRepository } from '@/modules/device/domain/repositories/device.repository'
import {
  compartments,
  devices,
} from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
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
    const { db } = yield* DrizzleClient
    const repository = yield* makeDrizzleRepository(
      devices,
      devices.id,
      DrizzleDeviceMapper
    )

    return {
      ...repository,

      findWithCompartment: Effect.fn(function* findWithCompartment(deviceId) {
        const [row] = yield* db
          .select({
            devices,
            compartments: sql<(typeof compartments.$inferSelect)[]>`COALESCE(
              json_agg(
                json_build_object(
                  'medicine', ${compartments.medicine},
                  'capacity', ${compartments.capacity},
                  'dosage', ${compartments.dosage},
                  'position', ${compartments.position},
                  'lastRefillAt', ${compartments.lastRefillAt},
                  'deviceId', ${compartments.deviceId}
                ) ORDER BY ${compartments.position} ASC
              ) FILTER (WHERE ${compartments.deviceId} IS NOT NULL),
            '[]'::json)`.as('compartments'),
          })
          .from(devices)
          .where(eq(devices.id, deviceId))
          .innerJoin(compartments, eq(compartments.deviceId, devices.id))
          .groupBy(devices.id)
          .limit(1)
          .pipe(Effect.orDie)
        if (!row) return null

        return DeviceCompartmentsAggregate.make({
          device: row.devices,
          compartments: row.compartments,
        })
      }),
    }
  })
)
