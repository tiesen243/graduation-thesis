import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AuthMiddleware } from '@/auth/middleware'
import { DeviceNotFound } from '@/device/schemas/device.error'
import { CreateScheduleDto } from '@/schedule/dto/create-schedule.dto'
import { ListSchedulesDto } from '@/schedule/dto/list-schedules.dto'
import { ShowScheduleDto } from '@/schedule/dto/show-schedule.dto'
import { UpdateScheduleDto } from '@/schedule/dto/update-schedule.dto'
import {
  ScheduleInvalid,
  ScheduleNotFound,
} from '@/schedule/schemas/schedule.error'

export class ScheduleGroup extends HttpApiGroup.make('schedule')
  .add(
    HttpApiEndpoint.get('list', '/', {
      query: ListSchedulesDto.Input,
      success: ListSchedulesDto,
    })
  )

  .add(
    HttpApiEndpoint.get('show', '/:id', {
      params: ShowScheduleDto.Input,
      success: ShowScheduleDto,
      error: [ScheduleNotFound],
    })
  )

  .add(
    HttpApiEndpoint.post('create', '/', {
      payload: CreateScheduleDto.Input,
      success: CreateScheduleDto,
      error: [ScheduleInvalid, DeviceNotFound],
    })
  )

  .add(
    HttpApiEndpoint.patch('update', '/:id', {
      params: UpdateScheduleDto.Params,
      payload: UpdateScheduleDto.Input,
      success: UpdateScheduleDto,
      error: [ScheduleNotFound, ScheduleInvalid, DeviceNotFound],
    })
  )

  .middleware(AuthMiddleware)

  .prefix('/api/schedules') {}
