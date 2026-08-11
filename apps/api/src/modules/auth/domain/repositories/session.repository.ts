import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

import type { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'
import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { IRepository } from '@/shared/repository'

interface ISessionRepository extends IRepository<Session> {
  readonly findWithUser: (
    id: Session['id']
  ) => Effect<SessionUserAggregate | null>
}

export class SessionRepository extends Context.Service<
  SessionRepository,
  ISessionRepository
>()('auth/domain/SessionRepository') {}
