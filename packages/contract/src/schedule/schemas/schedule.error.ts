import * as Schema from 'effect/Schema'

import { ScheduleId } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export class ScheduleNotFound extends Schema.TaggedError<ScheduleNotFound>()(
  'schedule/domain/ScheduleNotFound',
  ApiResponse({
    status: 404,
    message: 'Schedule not found',
    errorSchema: Schema.Struct({ id: ScheduleId }),
  }),
  { httpApiStatus: 404 }
) {}

export class ScheduleError extends Schema.TaggedError<ScheduleError>()(
  'schedule/domain/ScheduleError',
  {
    reason: Schema.Union([ScheduleNotFound]),
  }
) {}
