import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { ListUsersUseCase } from '@/modules/user/application/use-case/list-users.use-case.ts'
import { OneUserUseCase } from '@/modules/user/application/use-case/one-user.use-case'
import {
  ListUsersSuccess,
  OneUserSuccess,
} from '@/modules/user/presentation/http/user.group'

export const UserHandler = HttpApiBuilder.group(Api, 'user', (handlers) =>
  handlers
    .handle('list', ({ query }) =>
      ListUsersUseCase.use((s) => s.execute(query)).pipe(
        Effect.map((data) => ListUsersSuccess.make({ data }))
      )
    )

    .handle('show', ({ params }) =>
      OneUserUseCase.use((s) => s.execute(params)).pipe(
        Effect.map((data) => OneUserSuccess.make({ data }))
      )
    )
)
