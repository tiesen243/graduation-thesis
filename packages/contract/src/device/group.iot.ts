import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { DeviceStreamDto } from '@/device/dto/device-stream.dto'
import { DeviceMiddleware } from '@/device/middleware'

export class DeviceIoTGroup extends HttpApiGroup.make('device-iot')

  .add(
    HttpApiEndpoint.get('subscribe', '/subscribe', {
      success: DeviceStreamDto.Stream,
    })
  )

  .add(
    HttpApiEndpoint.post('emit', '/emit', {
      payload: DeviceStreamDto.Emit,
      success: DeviceStreamDto,
    })
  )

  .middleware(DeviceMiddleware)

  .prefix('/api/devices') {}
