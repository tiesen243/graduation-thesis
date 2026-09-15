import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { Cuid2 } from '@/schema'
import { PaymentId } from '@/subcription/schemas/payment.schema'

export const TransactionId = Cuid2.pipe(
  Schema.brand('subcription/domain/TransactionId')
)
export type TransactionId = typeof TransactionId.Type

export const TransactionGatewayId = Schema.Number.pipe(
  Schema.brand('subcription/domain/TransactionGatewayId')
)
export type TransactionGatewayId = typeof TransactionGatewayId.Type

export const TransactionSchema = Schema.Struct({
  id: TransactionId,

  paymentId: Schema.NullOr(PaymentId).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  gateway: Schema.String,

  gatewayId: TransactionGatewayId,

  accountNumber: Schema.String,

  code: Schema.NullOr(Schema.String).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  amountIn: Schema.Number.pipe(
    Schema.withConstructorDefault(Effect.succeed(0))
  ),

  amountOut: Schema.Number.pipe(
    Schema.withConstructorDefault(Effect.succeed(0))
  ),

  content: Schema.String,

  referenceCode: Schema.NullOr(Schema.String).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  transactionDate: Schema.String,
})
export type TransactionSchema = typeof TransactionSchema.Type
