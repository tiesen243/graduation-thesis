import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { Cuid2 } from '@/schema'
import { UserId } from '@/user/schemas/user.schema'

export const DeviceId = Cuid2.pipe(Schema.brand('device/domain/DeviceId'))
export type DeviceId = typeof DeviceId.Type

export const deviceStatuses = ['unlinked', 'linked', 'suspended'] as const
export const DeviceStatus = Schema.Literals(deviceStatuses).pipe(
  Schema.brand('device/domain/DeviceStatus')
)
export type DeviceStatus = typeof DeviceStatus.Type

export const DeviceSchema = Schema.Struct({
  id: DeviceId,

  factoryModel: Schema.String.check(Schema.isMaxLength(255)),

  status: DeviceStatus.pipe(
    Schema.withConstructorDefault(Effect.succeed('unlinked'))
  ),

  name: Schema.NullOr(Schema.String.check(Schema.isMaxLength(255))).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  position: Schema.NullOr(Schema.String.check(Schema.isMaxLength(255))).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  activatedAt: Schema.NullOr(Schema.Date).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  userId: Schema.NullOr(UserId).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),
})
