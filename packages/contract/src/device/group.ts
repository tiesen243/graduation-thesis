import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AdminMiddleware, AuthMiddleware } from '@/auth/middleware'
import { AddDeviceDto } from '@/device/dto/add-device.dto'
import { ListDevicesDto } from '@/device/dto/list-devices.dto'
import { ShowDeviceDto } from '@/device/dto/show-device.dto'
import {
  DeviceAlreadyExists,
  DeviceNotFound,
} from '@/device/schemas/device.error'

export class DeviceGroup extends HttpApiGroup.make('device')
  .add(
    HttpApiEndpoint.get('list', '/', {
      query: ListDevicesDto.Input,
      success: ListDevicesDto,
    }).middleware(AdminMiddleware)
  )

  .add(
    HttpApiEndpoint.get('me', '/me', {
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

  .add(
    HttpApiEndpoint.post('add', '/', {
      payload: AddDeviceDto.Input,
      success: AddDeviceDto,
      error: [DeviceAlreadyExists],
    }).middleware(AdminMiddleware)
  )

  .middleware(AuthMiddleware)

  .prefix('/api/devices') {}
