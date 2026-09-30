import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class UnlinkDeviceDto extends Schema.TaggedClass<UnlinkDeviceDto>()(
  'device/application/UnlinkDeviceDto',
  ApiResponse({
    message: 'Device unlinked successfully',
  })
) {}

export namespace UnlinkDeviceDto {
  export const Input = Schema.Struct({
    id: DeviceId,
  })
  export type Input = typeof Input.Type

  export const Output = UnlinkDeviceDto.fields.data
  export type Output = typeof Output.Type
}
