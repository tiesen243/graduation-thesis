import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { ListUsersDto } from '@/modules/user/application/dto/list-users.dto'

import { UserRepository } from '@/modules/user/domain/repositories/user.repository'

export class ListUsersUseCase extends Context.Service<
  ListUsersUseCase,
  {
    execute: (input: ListUsersDto.Input) => Effect.Effect<ListUsersDto.Output>
  }
>()('user/application/ListUsersUseCase', {
  make: Effect.gen(function* makeFn() {
    const userRepository = yield* Effect.service(UserRepository)

    return {
      execute: Effect.fn(function* make({ query, page, limit }) {
        const offset = (page - 1) * limit
        const where = query
          ? [
              { username: { like: `%${query}%` } },
              { email: { like: `%${query}%` } },
            ]
          : []

        const [users, total] = yield* Effect.all(
          [
            userRepository.findMany(where, {
              orderBy: { createdAt: 'desc' },
              limit,
              offset,
            }),
            userRepository.count(where),
          ],
          { concurrency: 'unbounded' }
        )
        const totalPages = Math.ceil(total / limit)

        return {
          users,
          meta: { page, pageSize: limit, total, totalPages },
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
