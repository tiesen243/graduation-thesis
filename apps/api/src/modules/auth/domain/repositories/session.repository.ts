import * as Context from 'effect/Context'

import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

// oxlint-disable-next-line typescript/no-empty-interface typescript/no-empty-object-type
export interface ISessionRepository extends IBaseRepository<Session> {}

export class SessionRepository extends Context.Service<
  SessionRepository,
  ISessionRepository
>()('auth/domain/SessionRepository') {}
