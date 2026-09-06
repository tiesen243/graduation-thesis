import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class CompartmentNotFound extends Schema.TaggedError<CompartmentNotFound>()(
  'device/domain/CompartmentNotFound',
  ApiResponse({
    status: 404,
    message: 'Compartment not found',
    errorSchema: Schema.Struct({
      deviceId: Schema.String,
      position: Schema.String,
    }),
  }),
  { httpApiStatus: 404 }
) {}

export class CompartmentError extends Schema.TaggedError<CompartmentError>()(
  'device/domain/CompartmentError',
  {
    reason: Schema.Union([CompartmentNotFound]),
  }
) {}
