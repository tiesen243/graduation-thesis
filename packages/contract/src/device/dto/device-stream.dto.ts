import * as Schema from 'effect/Schema'
import * as HttpApiSchema from 'effect/unstable/httpapi/HttpApiSchema'

import { DeviceNotFound } from '@/device/schemas/device.error'
import { DeviceId } from '@/device/schemas/device.schema'

export namespace DeviceStreamDto {
  export const Params = Schema.Struct({
    id: DeviceId,
  })
  export type Params = typeof Params.Type

  export const Stream = HttpApiSchema.StreamSse({
    data: Schema.Struct({
      action: Schema.String,
      payload: Schema.Unknown,
    }),
    error: DeviceNotFound,
  })
  export type Stream = typeof Stream.Type

  export const Emit = Schema.Struct({
    action: Schema.String,
    payload: Schema.Unknown,
  })
  export type Emit = typeof Emit.Type
}
