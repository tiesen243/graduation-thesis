import { UserSchema } from '@rozumari/contract/user/schemas/user.schema'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { User } from '@/modules/user/domain/entities/user.entity'

export const DrizzleUserMapper: DrizzleMapper<User, UserSchema> = {
  toEntity: (entity) => User.make(entity),
  toRow: encodeSync(UserSchema) as never,
}
