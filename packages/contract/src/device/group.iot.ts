import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import { DeviceStreamDto } from '@/device/dto/device-stream.dto'
import { DeviceMiddleware } from '@/device/middleware'
import { TodayScheduleDto } from '@/schedule/dto/today-schedule.dto'

export class IotGroup extends HttpApiGroup.make('iot')

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

  .add(
    HttpApiEndpoint.get('schedule-today', '/schedule/today', {
      success: TodayScheduleDto,
    })
  )

  .middleware(DeviceMiddleware)

  .prefix('/api/devices')
  .annotateMerge(OpenApi.annotations({ exclude: true })) {}
