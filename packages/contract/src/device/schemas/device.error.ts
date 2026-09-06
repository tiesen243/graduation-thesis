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

export class DeviceAlreadyExists extends Schema.TaggedError<DeviceAlreadyExists>()(
  'device/domain/DeviceAlreadyExists',
  ApiResponse({
    status: 409,
    message: 'Device already exists',
    errorSchema: Schema.Struct({
      id: Schema.NullOr(DeviceId),
      factoryModel: Schema.NullOr(Schema.String),
    }),
  }),
  { httpApiStatus: 409 }
) {}

export class DeviceAlreadyLinked extends Schema.TaggedError<DeviceAlreadyLinked>()(
  'device/domain/DeviceAlreadyLinked',
  ApiResponse({
    status: 400,
    message: 'Device already linked',
    errorSchema: Schema.Struct({ id: DeviceId }),
  }),
  { httpApiStatus: 400 }
) {}

export class DeviceNotLinked extends Schema.TaggedError<DeviceNotLinked>()(
  'device/domain/DeviceNotLinked',
  ApiResponse({
    status: 400,
    message: 'Device not linked',
    errorSchema: Schema.Struct({ id: DeviceId }),
  }),
  { httpApiStatus: 400 }
) {}

export class DeviceError extends Schema.TaggedError<DeviceError>()(
  'device/domain/DeviceError',
  {
    reason: Schema.Union([
      DeviceNotFound,
      DeviceAlreadyExists,
      DeviceAlreadyLinked,
      DeviceNotLinked,
    ]),
  }
) {}
