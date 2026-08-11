import * as Schema from 'effect/Schema'

import { DeviceSchema } from '@/device/schemas/device.schema'
import { ApiResponse, Pagination } from '@/schema'

export class ListDevicesDto extends Schema.TaggedClass<ListDevicesDto>()(
  'device/application/ListDevicesDto',
  ApiResponse({
    message: 'Get list of devices successfully',
    dataSchema: Schema.Struct({
      devices: Schema.Array(
        Schema.Struct({
          id: DeviceSchema.fields.id,
          factoryModel: DeviceSchema.fields.factoryModel,
          status: DeviceSchema.fields.status,
          name: DeviceSchema.fields.name,
          position: DeviceSchema.fields.position,
          activatedAt: DeviceSchema.fields.activatedAt,
        })
      ),
      meta: Pagination.Output,
    }),
  })
) {}

export namespace ListDevicesDto {
  export const Input = Pagination.Input.pipe(
    Schema.fieldsAssign({
      query: Schema.optional(Schema.String),
    })
  )
  export type Input = typeof Input.Type

  export const Output = ListDevicesDto.fields.data
  export type Output = typeof Output.Type
}
