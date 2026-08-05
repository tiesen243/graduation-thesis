import { AccountSchema } from '@rozumari/contract/auth/schemas/account.schema'
import * as Schema from 'effect/Schema'

export class Account extends Schema.TaggedClass<Account>()(
  'auth/domain/Account',
  AccountSchema
) {}
