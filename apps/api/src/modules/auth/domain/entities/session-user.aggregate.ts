import { UserSchema } from '@rozumari/contract/user/schemas/user.schema'
import * as Schema from 'effect/Schema'

import { Session } from '@/modules/auth/domain/entities/session.entity'

export class SessionUserAggregate extends Schema.TaggedClass<SessionUserAggregate>()(
  'auth/domain/SessionUserAggregate',
  {
    session: Session,
    user: UserSchema,
  }
) {}
