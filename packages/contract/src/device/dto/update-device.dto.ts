import * as Schema from 'effect/Schema'

import { DeviceSchema } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class UpdateDeviceDto extends Schema.TaggedClass<UpdateDeviceDto>()(
  'device/application/UpdateDeviceDto',
  ApiResponse({
    message: 'Update device successfully',
    dataSchema: Schema.Struct({
      id: DeviceSchema.fields.id,
    }),
  })
) {}

export namespace UpdateDeviceDto {
  export const Input = Schema.Struct({
    name: Schema.NullOr(Schema.String.check(Schema.isMaxLength(255))).pipe(
      Schema.optionalKey
    ),
    position: Schema.NullOr(Schema.String.check(Schema.isMaxLength(255))).pipe(
      Schema.optionalKey
    ),
  })
  export type Input = typeof Input.Type

  export const Output = UpdateDeviceDto.fields.data
  export type Output = typeof Output.Type
}
