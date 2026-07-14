import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { Http } from '@/shared/http'

import { User } from '@/modules/user/domain/entities/user.entity'
import { UserRepository } from '@/modules/user/domain/repositories/user.repository'

export class UserService extends Context.Tag(
  'modules/user/application/UserService'
)<
  UserService,
  {
    readonly findByIidentifier: (
      identifier: Partial<Pick<User, 'id' | 'email' | 'username'>>
    ) => Effect.Effect<User | null, Http, UserRepository>

    readonly create: (
      data: Pick<User, 'email' | 'username' | 'image'>
    ) => Effect.Effect<User, Http, UserRepository>
  }
>() {
  public static live = Layer.effect(
    this,
    Effect.gen(function* liveGen() {
      const userRepo = yield* UserRepository

      return {
        findByIidentifier: ({ id, email, username }) =>
          Effect.gen(function* findByEmailGen() {
            const [user] = yield* userRepo.find(
              [{ id }, { email }, { username }],
              {},
              { limit: 1 }
            )
            return user ?? null
          }),

        create: ({ email, username, image }) =>
          Effect.gen(function* createUserGen() {
            const user = User.make({ email, username, image })
            yield* userRepo.save(user)
            return user
          }),
      }
    })
  )
}
