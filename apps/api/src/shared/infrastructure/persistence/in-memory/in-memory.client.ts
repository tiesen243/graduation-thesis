import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { User } from '@/modules/user/domain/entities/user.entity'

export class InMemoryClient extends Context.Tag(
  'shared/infrastructure/persistence/in-memory/InMemoryClient'
)<
  InMemoryClient,
  {
    users: Ref.Ref<Map<User['id'], User>>
  }
>() {
  public static live = Layer.effect(
    InMemoryClient,
    Effect.gen(function* InMemoryClientGen() {
      return {
        users: yield* Ref.make(new Map<User['id'], User>()),
      }
    })
  )
}
