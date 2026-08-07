import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AuthMiddleware } from '@/auth/middleware'
import { ListDevicesDto } from '@/device/dto/list-devices.dto'
import { ShowDeviceDto } from '@/device/dto/show-device.dto'
import { DeviceNotFound } from '@/device/schemas/device.error'

export class DeviceGroup extends HttpApiGroup.make('device')
  .add(
    HttpApiEndpoint.get('list', '/', {
      query: ListDevicesDto.Input,
      success: ListDevicesDto,
    })
  )

  .add(
    HttpApiEndpoint.get('show', '/:id', {
      params: ShowDeviceDto.Input,
      success: ShowDeviceDto,
      error: [DeviceNotFound],
    })
  )

  .middleware(AuthMiddleware)

  .prefix('/api/devices') {}
