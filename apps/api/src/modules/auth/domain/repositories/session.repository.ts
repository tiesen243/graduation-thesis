import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

// oxlint-disable-next-line typescript/no-empty-interface typescript/no-empty-object-type
export interface ISessionRepository extends IBaseRepository<Session> {
  readonly findWithUser: (id: Session['id']) => Effect.Effect<Session | null>
}

export class SessionRepository extends Context.Service<
  SessionRepository,
  ISessionRepository
>()('auth/domain/SessionRepository') {}
