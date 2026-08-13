import * as Schema from 'effect/Schema'

import { CompartmentSchema } from '@/device/schemas/compartment.schema'
import { DeviceSchema } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class ShowDeviceDto extends Schema.TaggedClass<ShowDeviceDto>()(
  'device/application/ShowDeviceDto',
  ApiResponse({
    message: 'Get device successfully',
    dataSchema: Schema.Struct({
      id: DeviceSchema.fields.id,
      factoryModel: DeviceSchema.fields.factoryModel,
      status: DeviceSchema.fields.status,
      name: DeviceSchema.fields.name,
      position: DeviceSchema.fields.position,
      activatedAt: DeviceSchema.fields.activatedAt,
      compartments: Schema.Array(CompartmentSchema),
    }),
  })
) {}

export namespace ShowDeviceDto {
  export const Input = Schema.Struct({
    id: DeviceSchema.fields.id,
  })
  export type Input = typeof Input.Type

  export const Output = ShowDeviceDto.fields.data
  export type Output = typeof Output.Type
}
