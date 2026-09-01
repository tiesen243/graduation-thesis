import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

import type { DeviceCompartmentsAggregate } from '@/modules/device/domain/entities/device-compartments.aggregate'
import type { Device } from '@/modules/device/domain/entities/device.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

interface IDeviceRepository extends IBaseRepository<Device> {
  readonly findWithCompartment: (
    deviceId: DeviceId
  ) => Effect<DeviceCompartmentsAggregate | null>
}

export class DeviceRepository extends Context.Service<
  DeviceRepository,
  IDeviceRepository
>()('device/application/DeviceRepository') {}
