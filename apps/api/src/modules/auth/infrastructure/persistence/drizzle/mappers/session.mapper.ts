import { SessionSchema } from '@rozumari/contract/auth/schemas/session.schema'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Session } from '@/modules/auth/domain/entities/session.entity'

export const DrizzleSessionMapper: DrizzleMapper<Session, SessionSchema> = {
  toEntity: (entity) => Session.make(entity),
  toRow: encodeSync(SessionSchema) as never,
}
