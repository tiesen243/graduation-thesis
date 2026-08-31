import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

import type { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'
import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

interface ISessionRepository extends IBaseRepository<Session> {
  readonly findWithUser: (
    id: Session['id']
  ) => Effect<SessionUserAggregate | null>

  readonly deleteManyByUser: (userId: Session['userId']) => Effect<void>
}

export class SessionRepository extends Context.Service<
  SessionRepository,
  ISessionRepository
>()('auth/domain/SessionRepository') {}
