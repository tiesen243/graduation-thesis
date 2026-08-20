import * as Schema from 'effect/Schema'

import { DeviceSchema } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class LinkDeviceDto extends Schema.TaggedClass<LinkDeviceDto>()(
  'device/application/LinkDeviceDto',
  ApiResponse({
    message: 'Device linked successfully',
    dataSchema: Schema.Struct({
      id: DeviceSchema.fields.id,
      factoryModel: DeviceSchema.fields.factoryModel,
      status: DeviceSchema.fields.status,
      name: DeviceSchema.fields.name,
      userId: DeviceSchema.fields.userId,
    }),
  })
) {}

export namespace LinkDeviceDto {
  export const Input = Schema.Struct({
    id: DeviceSchema.fields.id,
  })
  export type Input = typeof Input.Type

  export const Output = LinkDeviceDto.fields.data
  export type Output = typeof Output.Type
}
