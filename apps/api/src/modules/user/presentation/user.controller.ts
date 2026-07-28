import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { ListUsersOutputDto } from '@/modules/user/application/dto/list-users.dto'
import {
  OneUserInputDto,
  OneUserOutputDto,
} from '@/modules/user/application/dto/one-user.dto'

export class UserController extends HttpApiGroup.make('user')
  .add(HttpApiEndpoint.get('list', '/', { success: ListUsersOutputDto }))

  .add(
    HttpApiEndpoint.get('show', '/:id', {
      params: OneUserInputDto,
      success: OneUserOutputDto,
    })
  )

  .prefix('/api/users') {}
