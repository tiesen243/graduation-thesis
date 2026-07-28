import * as Schema from 'effect/Schema'

import { User, UserId } from '@/modules/user/domain/entities/user.entity'
import { Http } from '@/shared/http'

export class OneUserInputDto extends Schema.Struct({
  id: UserId,
}) {}

export class OneUserOutputDto extends Http.extend<OneUserOutputDto>(
  'user/application/OneUserOutputDto'
)({
  data: User,
}) {}
