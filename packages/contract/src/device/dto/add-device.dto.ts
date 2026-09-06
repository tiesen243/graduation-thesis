import * as Schema from 'effect/Schema'

import { DeviceSchema } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class AddDeviceDto extends Schema.TaggedClass<AddDeviceDto>()(
  'device/application/AddDeviceDto',
  ApiResponse({
    message: 'Add device successfully',
    dataSchema: Schema.Array(
      Schema.Struct({
        id: DeviceSchema.fields.id,
        factoryModel: DeviceSchema.fields.factoryModel,
      })
    ),
  })
) {}

export namespace AddDeviceDto {
  export const Input = Schema.Struct({
    size: Schema.Literals(['sm', 'md', 'lg']),
    amount: Schema.Int.check(
      Schema.isGreaterThanOrEqualTo(1, {
        message: 'Amount must be greater than or equal to 1',
      })
    ),
  })
  export type Input = typeof Input.Type

  export const Output = AddDeviceDto.fields.data
  export type Output = typeof Output.Type
}
