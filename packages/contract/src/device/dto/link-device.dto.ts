import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class LinkDeviceDto extends Schema.TaggedClass<LinkDeviceDto>()(
  'device/application/LinkDeviceDto',
  ApiResponse({
    message: 'Device linked successfully',
  })
) {}

export namespace LinkDeviceDto {
  export const Input = Schema.Struct({
    token: Schema.String,
  })
  export type Input = typeof Input.Type

  export const Output = LinkDeviceDto.fields.data
  export type Output = typeof Output.Type
}
