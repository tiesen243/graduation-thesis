import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class LinkDeviceGenerateDto extends Schema.TaggedClass<LinkDeviceGenerateDto>()(
  'device/application/LinkDeviceGenerateDto',
  ApiResponse({
    message: 'Device link generated successfully',
    dataSchema: Schema.String,
  })
) {}

export namespace LinkDeviceGenerateDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = LinkDeviceGenerateDto.fields.data
  export type Output = typeof Output.Type
}
