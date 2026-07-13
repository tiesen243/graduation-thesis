import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'
import type { Http } from '@/shared/http'

// oxlint-disable-next-line typescript/no-empty-interface typescript/no-empty-object-type
export interface ISessionRepository extends IBaseRepository<Session> {
  readonly findWithUser: (
    id: Session['id']
  ) => Effect.Effect<Session | null, Http>
}

export class SessionRepository extends Context.Tag(
  'modules/user/domain/SessionRepository'
)<SessionRepository, ISessionRepository>() {}
