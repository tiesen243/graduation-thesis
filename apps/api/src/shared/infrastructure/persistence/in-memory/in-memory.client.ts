import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { Account } from '@/modules/auth/domain/entities/account.entity'
import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { User } from '@/modules/user/domain/entities/user.entity'

export class InMemoryClient extends Context.Tag(
  'shared/infrastructure/persistence/in-memory/InMemoryClient'
)<
  InMemoryClient,
  {
    accounts: Ref.Ref<Map<string, Account>>
    sessions: Ref.Ref<Map<Session['id'], Session>>
    users: Ref.Ref<Map<User['id'], User>>
  }
>() {
  public static live = Layer.effect(
    InMemoryClient,
    Effect.gen(function* InMemoryClientGen() {
      return {
        accounts: yield* Ref.make(new Map<string, Account>()),
        sessions: yield* Ref.make(new Map<Session['id'], Session>()),
        users: yield* Ref.make(new Map<User['id'], User>()),
      }
    })
  )
}
