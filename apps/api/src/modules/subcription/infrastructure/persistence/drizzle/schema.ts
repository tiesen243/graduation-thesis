import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type {
  PaymentId,
  PaymentStatus,
} from '@rozumari/contract/subcription/schemas/payment.schema'
import type { PlanId } from '@rozumari/contract/subcription/schemas/plan.schema'
import type {
  SubcriptionId,
  SubcriptionStatus,
} from '@rozumari/contract/subcription/schemas/subcription.schema'
import type {
  TransactionGatewayId,
  TransactionId,
} from '@rozumari/contract/subcription/schemas/transaction.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { paymentStatuses } from '@rozumari/contract/subcription/schemas/payment.schema'
import { subcriptionStatuses } from '@rozumari/contract/subcription/schemas/subcription.schema'
import { index, pgEnum, snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

import { devices } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const subscriptionStatusEnum = pgEnum(
  'subscription_status',
  subcriptionStatuses
)

export const paymentStatusEnum = pgEnum('payment_status', paymentStatuses)

export const plans = snakeCase.table(
  'plans',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<PlanId>(),

    name: t.varchar({ length: 50 }).notNull(),
    price: t.numeric({ precision: 10, scale: 2 }).notNull(),
    duration: t.integer().notNull(),
    createdAt: t.timestamp({ mode: 'date' }).notNull(),
  }),
  (t) => [index('plans_name_idx').on(t.name)]
)

export const subscriptions = snakeCase.table(
  'subscriptions',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<SubcriptionId>(),
    userId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .$type<UserId>(),
    deviceId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' })
      .$type<DeviceId>(),
    planId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' })
      .$type<PlanId>(),

    status: subscriptionStatusEnum().notNull().$type<SubcriptionStatus>(),
    startedAt: t.timestamp({ mode: 'date' }).notNull(),
    expiredAt: t.timestamp({ mode: 'date' }).notNull(),

    createdAt: t.timestamp({ mode: 'date' }).notNull(),
    updatedAt: t.timestamp({ mode: 'date' }).notNull(),
  }),
  (t) => [
    uniqueIndex('subscriptions_user_id_device_id_uq_idx').on(
      t.userId,
      t.deviceId
    ),
    index('subscriptions_user_id_idx').on(t.userId),
    index('subscriptions_device_id_idx').on(t.deviceId),
    index('subscriptions_plan_id_idx').on(t.planId),
  ]
)

export const payments = snakeCase.table('payments', (t) => ({
  id: t.varchar({ length: 24 }).primaryKey().$type<PaymentId>(),
  subscriptionId: t
    .varchar({ length: 24 })
    .references(() => subscriptions.id, { onDelete: 'set null' })
    .$type<SubcriptionId>(),

  amount: t.numeric({ precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum().notNull().$type<PaymentStatus>(),

  createdAt: t.timestamp({ mode: 'date' }).notNull(),
  updatedAt: t.timestamp({ mode: 'date' }).notNull(),
}))

export const transactions = snakeCase.table(
  'transactions',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<TransactionId>(),
    paymentId: t
      .varchar({ length: 24 })
      .references(() => payments.id, { onDelete: 'set null' })
      .$type<PaymentId>(),

    gateway: t.varchar({ length: 100 }).notNull(),
    gatewayId: t.integer().notNull().$type<TransactionGatewayId>(),
    accountNumber: t.varchar({ length: 100 }),
    code: t.varchar({ length: 255 }),
    amountIn: t.numeric({ precision: 10, scale: 2 }).notNull(),
    amountOut: t.numeric({ precision: 10, scale: 2 }).notNull(),
    content: t.text(),
    referenceCode: t.varchar({ length: 255 }),
    transactionDate: t.timestamp({ mode: 'date' }).notNull(),
  }),
  (t) => [
    uniqueIndex('transactions_gateway_id_uq_idx').on(t.gatewayId),
    index('transactions_code_idx').on(t.code),
    index('transactions_account_number_transaction_date_idx').on(
      t.accountNumber,
      t.transactionDate
    ),
  ]
)
