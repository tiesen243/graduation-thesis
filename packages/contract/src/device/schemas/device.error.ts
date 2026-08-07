import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { ApiResponse } from '@/schema'

export class DeviceNotFound extends Schema.TaggedError<DeviceNotFound>()(
  'device/domain/DeviceNotFound',
  ApiResponse({
    status: 404,
    message: 'Device not found',
    errorSchema: Schema.Struct({ id: DeviceId }),
  }),
  { httpApiStatus: 404 }
) {}

export class DeviceError extends Schema.TaggedError<DeviceError>()(
  'device/domain/DeviceError',
  {
    reason: Schema.Union([DeviceNotFound]),
  }
) {}
