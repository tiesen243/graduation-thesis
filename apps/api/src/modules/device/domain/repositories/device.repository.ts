import * as Context from 'effect/Context'

import type { Device } from '@/modules/device/domain/entities/device.entity'
import type { IRepository } from '@/shared/repository'

interface IDeviceRepository extends IRepository<Device> {}

export class DeviceRepository extends Context.Service<
  DeviceRepository,
  IDeviceRepository
>()('device/domain/DeviceRepository') {}
