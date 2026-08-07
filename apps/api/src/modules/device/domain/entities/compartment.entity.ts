import { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'
import * as Schema from 'effect/Schema'

export class Compartment extends Schema.TaggedClass<Compartment>()(
  'device/domain/Compartment',
  CompartmentSchema
) {}
