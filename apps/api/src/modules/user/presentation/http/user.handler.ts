import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { ListUsersUseCase } from '@/modules/user/application/use-case/list-users.use-case.ts'
import { OneUserUseCase } from '@/modules/user/application/use-case/one-user.use-case'
import { makeHttp } from '@/shared/http'

export const UserHandler = HttpApiBuilder.group(Api, 'user', (handlers) =>
  handlers
    .handle(
      'list',
      Effect.fn(function* listUsersHandler({ query }) {
        const output = yield* ListUsersUseCase.use((s) =>
          s.execute(query)
        ).pipe(Effect.orDie)

        return makeHttp({
          data: output,
        })
      })
    )
    .handle(
      'show',
      Effect.fn(function* showUserHandler({ params }) {
        const output = yield* OneUserUseCase.use((s) => s.execute(params)).pipe(
          Effect.orDie
        )

        return makeHttp({
          data: output,
        })
      })
    )
)
