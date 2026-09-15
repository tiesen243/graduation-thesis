import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { Cuid2, Timestampz } from '@/schema'
import { PlanId } from '@/subcription/schemas/plan.schema'
import { UserId } from '@/user/schemas/user.schema'

export const SubcriptionId = Cuid2.pipe(
  Schema.brand('subcription/domain/SubcriptionId')
)
export type SubcriptionId = typeof SubcriptionId.Type

export const subcriptionStatuses = [
  'pending',
  'active',
  'expired',
  'canceled',
] as const
export const SubcriptionStatus = Schema.Literals(subcriptionStatuses).pipe(
  Schema.brand('subcription/domain/SubcriptionStatus')
)
export type SubcriptionStatus = typeof SubcriptionStatus.Type

export const SubcriptionSchema = Schema.Struct({
  id: SubcriptionId,

  userId: UserId,

  deviceId: DeviceId,

  planId: PlanId,

  status: SubcriptionStatus.pipe(
    Schema.withConstructorDefault(Effect.succeed('pending'))
  ),

  startedAt: Schema.Date,

  expiredAt: Schema.Date,

  ...Timestampz.fields,
})
