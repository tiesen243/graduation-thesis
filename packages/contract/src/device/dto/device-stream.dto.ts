import * as Schema from 'effect/Schema'
import * as HttpApiSchema from 'effect/unstable/httpapi/HttpApiSchema'

import { DeviceError } from '@/device/schemas/device.error'

export namespace DeviceStreamDto {
  export const Data = HttpApiSchema.StreamSse({
    data: Schema.Struct({
      id: Schema.String,
    }),
    error: DeviceError,
  })
  export type Data = typeof Data.Type

  export const Emit = Schema.Struct({
    message: Schema.String.check(Schema.isMaxLength(255)),
  })
  export type Emit = typeof Emit.Type
}
