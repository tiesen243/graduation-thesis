import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'

export const CompartmentSchema = Schema.Struct({
  medicine: Schema.NullOr(Schema.String.check(Schema.isMaxLength(255))).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  capacity: Schema.Int.pipe(Schema.withConstructorDefault(Effect.succeed(0))),

  dosage: Schema.Number.pipe(Schema.withConstructorDefault(Effect.succeed(0))),

  position: Schema.String.check(Schema.isMaxLength(4)),

  lastRefillAt: Schema.NullOr(Schema.Date).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  deviceId: DeviceId,
})
export type CompartmentSchema = typeof CompartmentSchema.Type
