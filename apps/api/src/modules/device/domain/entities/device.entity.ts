import { DeviceSchema } from '@rozumari/contract/device/schemas/device.schema'
import * as Schema from 'effect/Schema'

export class Device extends Schema.TaggedClass<Device>()(
  'device/domain/Device',
  DeviceSchema
) {}
