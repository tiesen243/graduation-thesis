import { Api } from '@rozumari/contract'
import { ListUsersDto } from '@rozumari/contract/user/dto/list-users.dto'
import { ShowUserDto } from '@rozumari/contract/user/dto/show-user.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { ListUsersUseCase } from '@/modules/user/application/use-case/list-users.use-case'
import { ShowUserUseCase } from '@/modules/user/application/use-case/show-user.use-case'

export const userController = HttpApiBuilder.group(Api, 'user', (handlers) =>
  handlers
    .handle('list', ({ query }) =>
      ListUsersUseCase.use((s) => s.execute(query)).pipe(
        Effect.map((data) => ListUsersDto.make({ data }))
      )
    )
    .handle('show', ({ params }) =>
      ShowUserUseCase.use((s) => s.execute(params)).pipe(
        Effect.map((data) => ShowUserDto.make({ data }))
      )
    )
)
