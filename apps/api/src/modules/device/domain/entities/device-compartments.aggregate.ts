import { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'
import { DeviceSchema } from '@rozumari/contract/device/schemas/device.schema'
import * as Schema from 'effect/Schema'

export class DeviceCompartmentsAggregate extends Schema.TaggedClass<DeviceCompartmentsAggregate>()(
  'device/domain/DeviceCompartmentsAggregate',
  {
    device: DeviceSchema,
    compartments: Schema.Array(CompartmentSchema),
  }
) {}
