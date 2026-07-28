import { Effect } from 'effect'
import { HttpApiBuilder } from 'effect/unstable/httpapi'

import { Api } from '@/api'
import { ListUsersOutputDto } from '@/modules/user/application/dto/list-users.dto'
import { OneUserOutputDto } from '@/modules/user/application/dto/one-user.dto'
import { User } from '@/modules/user/domain/entities/user.entity'

export const UserLive = HttpApiBuilder.group(Api, 'user', (handlers) =>
  handlers
    .handle('list', () => Effect.succeed(ListUsersOutputDto.make({ data: [] })))
    .handle('show', ({ params }) =>
      Effect.succeed(
        OneUserOutputDto.make({
          data: User.make({ id: params.id, username: 'John Doe' }),
        })
      )
    )
)
