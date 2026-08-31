import type { UserQueryError } from '@rozumari/contract/user/schemas/user.error'

import { ListUsersDto } from '@rozumari/contract/user/dto/list-users.dto'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserRepository } from '@/modules/user/application/ports/user.repository'

export class ListUsersUseCase extends Context.Service<
  ListUsersUseCase,
  {
    readonly execute: (
      input: ListUsersDto.Input
    ) => Effect.Effect<ListUsersDto.Output, UserQueryError>
  }
>()('user/application/ListUsersUseCase', {
  make: Effect.gen(function* make() {
    const userRepository = yield* UserRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { page = 1, limit = 10, query = '' } = input
        const offset = (page - 1) * limit

        const where = query
          ? ({
              OR: {
                username: { like: `%${query}%`, mode: 'insensitive' },
                email: { like: `%${query}%`, mode: 'insensitive' },
              },
            } satisfies NonNullable<
              Parameters<typeof userRepository.findMany>[0]
            >['where'])
          : {}

        const [users, total] = yield* Effect.all(
          [
            userRepository.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              limit,
              offset,
            }),
            userRepository.count(where),
          ],
          { concurrency: 'unbounded' }
        )
        const totalPages = Math.ceil(total / limit)

        return ListUsersDto.Output.make({
          users,
          meta: { page, pageSize: limit, total, totalPages },
        })
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
