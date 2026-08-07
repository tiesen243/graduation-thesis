import * as Schema from 'effect/Schema'

import { DeviceSchema } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class AddDeviceDto extends Schema.TaggedClass<AddDeviceDto>()(
  'device/application/AddDeviceDto',
  ApiResponse({
    message: 'Add device successfully',
    dataSchema: Schema.Struct({
      id: DeviceSchema.fields.id,
    }),
  })
) {}

export namespace AddDeviceDto {
  export const Input = Schema.Struct({
    factoryModel: DeviceSchema.fields.factoryModel,
  })
  export type Input = typeof Input.Type

  export const Output = AddDeviceDto.fields.data
  export type Output = typeof Output.Type
}
