import type { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import type { Device } from '@/modules/device/domain/entities/device.entity'

export class DeviceService extends Context.Service<
  DeviceService,
  {
    readonly find: (id: DeviceId) => Effect<Device, DeviceNotFound>
    readonly findCompartments: (
      id: DeviceId
    ) => Effect<Compartment[], DeviceNotFound>
  }
>()('device/application/DeviceService') {}
