import { Api } from '@rozumari/contract'
import { DeleteUserDto } from '@rozumari/contract/user/dto/delete-user.dto'
import { ListUsersDto } from '@rozumari/contract/user/dto/list-users.dto'
import { ShowUserDto } from '@rozumari/contract/user/dto/show-user.dto'
import { UpdateUserDto } from '@rozumari/contract/user/dto/update-user.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { DeleteUserUseCase } from '@/modules/user/application/use-case/delete-user.use-case'
import { ListUsersUseCase } from '@/modules/user/application/use-case/list-users.use-case'
import { ShowUserUseCase } from '@/modules/user/application/use-case/show-user.use-case'
import { UpdateUserUseCase } from '@/modules/user/application/use-case/update-user.use-case'

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
    .handle('update', ({ params, payload }) =>
      UpdateUserUseCase.use((s) => s.execute({ ...params, ...payload })).pipe(
        Effect.map((data) => UpdateUserDto.make({ data }))
      )
    )
    .handle('delete', ({ params }) =>
      DeleteUserUseCase.use((s) => s.execute(params)).pipe(
        Effect.map((data) => DeleteUserDto.make({ data }))
      )
    )
)
