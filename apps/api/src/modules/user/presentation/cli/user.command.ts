import { UserId } from '@rozumari/contract/user/schemas/user.schema'
import * as Effect from 'effect/Effect'
import * as Command from 'effect/unstable/cli/Command'
import * as Flag from 'effect/unstable/cli/Flag'

import { ListUsersUseCase } from '@/modules/user/application/use-case/list-users.use-case'
import { ShowUserUseCase } from '@/modules/user/application/use-case/show-user.use-case'

const listUsers = Command.make(
  'list',
  {
    query: Flag.String('query').pipe(Flag.withDefault('')),
    page: Flag.Int('page').pipe(Flag.withDefault(1)),
    limit: Flag.Int('limit').pipe(Flag.withDefault(10)),
  },
  Effect.fn(function* listUsersFn(input) {
    const { users, meta } = yield* ListUsersUseCase.use((s) => s.execute(input))

    yield* Effect.log(`Users: ${JSON.stringify(users, null, 2)}`)
    yield* Effect.log(`Meta: ${JSON.stringify(meta, null, 2)}`)
  })
)

const showUser = Command.make(
  'show',
  {
    id: Flag.String('id'),
  },
  Effect.fn(function* showUserFn(input) {
    const user = yield* ShowUserUseCase.use((s) =>
      s.execute({ id: UserId.make(input.id) })
    )

    yield* Effect.log(`User: ${JSON.stringify(user, null, 2)}`)
  })
)

export const userCommand = Command.make('user').pipe(
  Command.withSubcommands([listUsers, showUser])
)
