import * as Schema from 'effect/Schema'

import { DeviceSchema } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class UpdateCapacityDto extends Schema.TaggedClass<UpdateCapacityDto>()(
  'device/application/UpdateCapacityDto',
  ApiResponse({
    message: 'Update device capacity successfully',
    dataSchema: Schema.Struct({
      id: DeviceSchema.fields.id,
    }),
  })
) {}

export namespace UpdateCapacityDto {
  export const Input = Schema.Struct({
    mode: Schema.Literals(['replacement', 'addition', 'subtraction']),
    slots: Schema.Array(
      Schema.Struct({
        position: Schema.String.check(Schema.isMaxLength(4)),
        capacity: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
      })
    ),
  })
  export type Input = typeof Input.Type

  export const Output = UpdateCapacityDto.fields.data
  export type Output = typeof Output.Type
}
