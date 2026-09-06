import { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'
import { encodeSync } from 'effect/SchemaParser'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Compartment } from '@/modules/device/domain/entities/compartment.entity'

export const DrizzleCompartmentMapper: DrizzleMapper<
  Compartment,
  CompartmentSchema
> = {
  toEntity: (entity) => Compartment.make(entity),
  toRow: encodeSync(CompartmentSchema) as never,
}
