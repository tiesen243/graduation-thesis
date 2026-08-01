import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'
import * as HttpApiSchema from 'effect/unstable/httpapi/HttpApiSchema'

import { ListUsersDto } from '@/modules/user/application/dto/list-users.dto'
import { OneUserDto } from '@/modules/user/application/dto/one-user.dto'
import { UserNotFound } from '@/modules/user/domain/entities/user.error'
import { Http } from '@/shared/http'

export class UserGroup extends HttpApiGroup.make('user')
  .add(
    HttpApiEndpoint.get('list', '/', {
      query: ListUsersDto.Input,
      success: Http(ListUsersDto.Output),
    })
  )

  .add(
    HttpApiEndpoint.get('show', '/:id', {
      params: OneUserDto.Input,
      success: Http(OneUserDto.Output),
      error: UserNotFound.pipe(HttpApiSchema.status(404)),
    })
  )

  .prefix('/api/users') {}
