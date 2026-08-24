import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AdminMiddleware, AuthMiddleware } from '@/auth/middleware'
import { Forbidden } from '@/auth/schemas/auth.error'
import { AddDeviceDto } from '@/device/dto/add-device.dto'
import { DeviceStreamDto } from '@/device/dto/device-stream.dto'
import { LinkDeviceDto } from '@/device/dto/link-device.dto'
import { ListDevicesDto } from '@/device/dto/list-devices.dto'
import { ShowDeviceDto } from '@/device/dto/show-device.dto'
import { UpdateCompartmentDto } from '@/device/dto/update-compartment.dto'
import { UpdateDeviceDto } from '@/device/dto/update-device.dto'
import { CompartmentNotFound } from '@/device/schemas/compartment.error'
import {
  DeviceAlreadyExists,
  DeviceAlreadyLinked,
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

  .add(
    HttpApiEndpoint.post('link', '/:id/link', {
      params: LinkDeviceDto.Input,
      success: LinkDeviceDto,
      error: [DeviceNotFound, DeviceAlreadyLinked],
    })
  )

  .add(
    HttpApiEndpoint.patch('update', '/:id', {
      params: ShowDeviceDto.Input,
      payload: UpdateDeviceDto.Input,
      success: UpdateDeviceDto,
      error: [DeviceNotFound, Forbidden],
    })
  )

  .add(
    HttpApiEndpoint.patch('update-compartment', '/:id/:position', {
      params: UpdateCompartmentDto.Params,
      payload: UpdateCompartmentDto.Input,
      success: UpdateCompartmentDto,
      error: [CompartmentNotFound],
    })
  )

  .add(
    HttpApiEndpoint.get('subscribe', '/:id/subscribe', {
      params: DeviceStreamDto.Params,
      success: DeviceStreamDto.Stream,
    })
  )

  .add(
    HttpApiEndpoint.post('emit', '/:id/emit', {
      params: DeviceStreamDto.Params,
      payload: DeviceStreamDto.Emit,
      error: [DeviceNotFound],
    })
  )

  .middleware(AuthMiddleware)

  .prefix('/api/devices') {}
