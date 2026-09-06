import * as Schema from 'effect/Schema'

import { CompartmentSchema } from '@/device/schemas/compartment.schema'
import { DeviceId } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class UpdateCompartmentDto extends Schema.TaggedClass<UpdateCompartmentDto>()(
  'device/application/UpdateCompartmentDto',
  ApiResponse({
    message: 'Update compartment successfully',
  })
) {}

export namespace UpdateCompartmentDto {
  export const Params = Schema.Struct({
    id: DeviceId,
    position: CompartmentSchema.fields.position,
  })
  export type Params = typeof Params.Type

  export const Input = Schema.Struct({
    medicine: Schema.String,
    capacity: CompartmentSchema.fields.capacity,
    dosage: CompartmentSchema.fields.dosage,
  })
  export type Input = typeof Input.Type

  export const Output = UpdateCompartmentDto.fields.data
  export type Output = typeof Output.Type
}
