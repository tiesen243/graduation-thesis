import { DeviceSchema } from '@rozumari/contract/device/schemas/device.schema'
import { encodeSync } from 'effect/SchemaParser'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Device } from '@/modules/device/domain/entities/device.entity'

export const DrizzleDeviceMapper: DrizzleMapper<Device, DeviceSchema> = {
  toEntity: (entity) => Device.make(entity),
  toRow: encodeSync(DeviceSchema) as never,
}
