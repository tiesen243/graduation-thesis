import * as Schema from 'effect/Schema'
import * as HttpApiSchema from 'effect/unstable/httpapi/HttpApiSchema'

import { DeviceNotFound } from '@/device/schemas/device.error'
import { DeviceId } from '@/device/schemas/device.schema'

export namespace DeviceStreamDto {
  export const Params = Schema.Struct({
    id: DeviceId,
  })
  export type Params = typeof Params.Type

  export const Data = HttpApiSchema.StreamSse({
    data: Schema.Struct({
      message: Schema.String,
    }),
    error: DeviceNotFound,
  })
  export type Data = typeof Data.Type

  export const Emit = Schema.Struct({
    message: Schema.String,
  })
  export type Emit = typeof Emit.Type
}
