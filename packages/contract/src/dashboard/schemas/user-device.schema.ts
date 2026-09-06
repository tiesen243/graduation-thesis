import * as Schema from 'effect/Schema'

import { DeviceSchema } from '@/device/schemas/device.schema'

export const UserDeviceSchema = Schema.Struct({
  id: DeviceSchema.fields.id,
  factoryModel: DeviceSchema.fields.factoryModel,
  status: DeviceSchema.fields.status,
  name: DeviceSchema.fields.name,
  position: DeviceSchema.fields.position,
  activatedAt: DeviceSchema.fields.activatedAt,
})
