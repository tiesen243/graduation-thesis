import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { DeviceMiddleware } from '@/device/middleware'
import { ListSchedulesDto } from '@/schedule/dto/list-schedules.dto'

export class ScheduleIoTGroup extends HttpApiGroup.make('schedule-iot')
  .add(
    HttpApiEndpoint.get('today', '/today', {
      success: ListSchedulesDto,
    })
  )

  .middleware(DeviceMiddleware)

  .prefix('/api/schedules') {}
