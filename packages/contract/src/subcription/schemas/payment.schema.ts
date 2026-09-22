import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { Cuid2, Timestampz } from '@/schema'
import { SubcriptionId } from '@/subcription/schemas/subcription.schema'

export const PaymentId = Cuid2.pipe(
  Schema.brand('subcription/domain/PaymentId')
)
export type PaymentId = typeof PaymentId.Type

export const paymentStatuses = ['pending', 'paid', 'failed'] as const
export const PaymentStatus = Schema.Literals(paymentStatuses).pipe(
  Schema.brand('subcription/domain/PaymentStatus')
)
export type PaymentStatus = typeof PaymentStatus.Type

export const PaymentSchema = Schema.Struct({
  id: PaymentId,

  subscriptionId: Schema.NullOr(SubcriptionId).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  amount: Schema.NumberFromString.check(Schema.isGreaterThan(0)),

  status: PaymentStatus,

  ...Timestampz.fields,
})
export type Payment = typeof PaymentSchema.Type
