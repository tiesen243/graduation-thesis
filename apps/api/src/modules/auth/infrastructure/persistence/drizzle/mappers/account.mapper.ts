import { AccountSchema } from '@rozumari/contract/auth/schemas/account.schema'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Account } from '@/modules/auth/domain/entities/account.entity'

export const DrizzleAccountMapper: DrizzleMapper<Account, AccountSchema> = {
  toEntity: (entity) => Account.make(entity),
  toRow: encodeSync(AccountSchema) as never,
}
