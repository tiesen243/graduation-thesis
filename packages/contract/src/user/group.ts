import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AdminMiddleware, AuthMiddleware } from '@/auth/middleware'
import { ListUsersDto } from '@/user/dto/list-users.dto'
import { ShowUserDto } from '@/user/dto/show-user.dto'
import { UserNotFound, UserQueryError } from '@/user/schemas/user.error'

export class UserGroup extends HttpApiGroup.make('user')
  .add(
    HttpApiEndpoint.get('list', '/', {
      query: ListUsersDto.Input,
      success: ListUsersDto,
      error: UserQueryError,
    })
  )

  .add(
    HttpApiEndpoint.get('show', '/:id', {
      params: ShowUserDto.Input,
      success: ShowUserDto,
      error: UserNotFound,
    })
  )

  .middleware(AdminMiddleware)
  .middleware(AuthMiddleware)

  .prefix('/api/users') {}
