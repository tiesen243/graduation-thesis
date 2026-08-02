import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AuthMiddleware } from '@/modules/auth/presentation/api/auth.middleware'
import { ListUsersDto } from '@/modules/user/application/dto/list-users.dto'
import { OneUserDto } from '@/modules/user/application/dto/one-user.dto'
import { UserNotFound } from '@/modules/user/domain/entities/user.error'
import { ApiResponseSchema } from '@/shared/schema'

export class ListUsersSuccess extends Schema.TaggedClass<ListUsersSuccess>()(
  'user/presentation/ListUsersSuccess',
  ApiResponseSchema(ListUsersDto.Output)
) {}

export class OneUserSuccess extends Schema.TaggedClass<OneUserSuccess>()(
  'user/presentation/OneUserSuccess',
  ApiResponseSchema(OneUserDto.Output)
) {}

export class UserGroup extends HttpApiGroup.make('user')
  .add(
    HttpApiEndpoint.get('list', '/', {
      query: ListUsersDto.Input,
      success: ListUsersSuccess,
    })
  )

  .add(
    HttpApiEndpoint.get('show', '/:id', {
      params: OneUserDto.Input,
      success: OneUserSuccess,
      error: UserNotFound,
    })
  )

  .middleware(AuthMiddleware)

  .prefix('/api/users') {}
