import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AdminMiddleware, AuthMiddleware } from '@/auth/middleware'
import { Forbidden } from '@/auth/schemas/auth.error'
import { DeleteUserDto } from '@/user/dto/delete-user.dto'
import { ListUsersDto } from '@/user/dto/list-users.dto'
import { ShowUserDto } from '@/user/dto/show-user.dto'
import { UpdateUserDto } from '@/user/dto/update-user.dto'
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

  .add(
    HttpApiEndpoint.patch('update', '/:id', {
      params: ShowUserDto.Input,
      payload: UpdateUserDto.Input,
      success: UpdateUserDto,
      error: [UserNotFound, Forbidden],
    })
  )

  .add(
    HttpApiEndpoint.delete('delete', '/:id', {
      params: DeleteUserDto.Input,
      success: DeleteUserDto,
      error: [UserNotFound, Forbidden],
    })
  )

  .middleware(AdminMiddleware)
  .middleware(AuthMiddleware)

  .prefix('/api/users') {}
