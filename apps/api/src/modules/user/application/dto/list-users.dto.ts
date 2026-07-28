import * as Schema from 'effect/Schema'

import { User } from '@/modules/user/domain/entities/user.entity'
import { Http } from '@/shared/http'

export class ListUsersOutputDto extends Http.extend<ListUsersOutputDto>(
  'user/application/ListUsersOutputDto'
)({
  data: Schema.Array(User),
}) {}
