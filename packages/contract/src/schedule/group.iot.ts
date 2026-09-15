import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { DeviceMiddleware } from '@/device/middleware'
import { ListSchedulesDto } from '@/schedule/dto/list-schedules.dto'
import { UpdateScheduleDto } from '@/schedule/dto/update-schedule.dto'
import {
  ScheduleInvalid,
  ScheduleNotFound,
} from '@/schedule/schemas/schedule.error'

export class ScheduleIoTGroup extends HttpApiGroup.make('schedule-iot')
  .add(
    HttpApiEndpoint.get('today', '/today', {
      query: Schema.Struct({
        date: Schema.optional(ListSchedulesDto.Input.fields.startDate),
      }),
      success: ListSchedulesDto,
    })
  )

  .add(
    HttpApiEndpoint.post('update-status', '/:id/update-status', {
      params: UpdateScheduleDto.Params,
      payload: Schema.Struct({
        status: UpdateScheduleDto.Input.fields.status,
      }),
      success: UpdateScheduleDto,
      error: [ScheduleNotFound, ScheduleInvalid],
    })
  )

  .middleware(DeviceMiddleware)

  .prefix('/api/schedules') {}
