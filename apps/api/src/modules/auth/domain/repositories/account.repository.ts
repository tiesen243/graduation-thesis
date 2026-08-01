import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

import type { Account } from '@/modules/auth/domain/entities/account.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

export interface IAccountRepository extends Omit<
  IBaseRepository<Account>,
  'findOne'
> {
  readonly findOne: (
    provider: Pick<Account, 'provider' | 'providerAccountId'>
  ) => Effect<Account | null>
}

export class AccountRepository extends Context.Service<
  AccountRepository,
  IAccountRepository
>()('auth/domain/AccountRepository') {}
