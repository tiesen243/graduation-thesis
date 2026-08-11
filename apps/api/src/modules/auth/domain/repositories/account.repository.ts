import * as Context from 'effect/Context'

import type { Account } from '@/modules/auth/domain/entities/account.entity'
import type { IRepository } from '@/shared/repository'

interface IAccountRepository extends IRepository<Account> {}

export class AccountRepository extends Context.Service<
  AccountRepository,
  IAccountRepository
>()('auth/domain/AccountRepository') {}
