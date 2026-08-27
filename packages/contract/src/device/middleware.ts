// oxlint-disable max-classes-per-file

import * as Context from 'effect/Context'
import * as HttpApiMiddleware from 'effect/unstable/httpapi/HttpApiMiddleware'
import * as HttpApiSecurity from 'effect/unstable/httpapi/HttpApiSecurity'

import type { DeviceId } from '@/device/schemas/device.schema'

import { DeviceNotFound } from '@/device/schemas/device.error'

export class CurrentDevice extends Context.Service<CurrentDevice, DeviceId>()(
  'device/middleware/CurrentDevice'
) {}

export class DeviceMiddleware extends HttpApiMiddleware.Service<
  DeviceMiddleware,
  {
    // Middleware can provide services to other middleware and endpoints, which is
    // useful for things like authentication, where you want to inject the current
    // user into the context for other endpoints to consume.
    provides: CurrentDevice

    // If your middleware requires dependencies from other middleware, you can
    // specify those as well.
    requires: never
  }
>()('device/middleware/DeviceMiddleware', {
  // This middleware requires clients to also provide an implementation, to
  // inject a api key
  requiredForClient: false,

  // Middleware can optionally define security schemes, which are used to
  // generate OpenAPI docs and decode credientials from incoming requests for
  // you.
  security: {
    bearer: HttpApiSecurity.bearer,
  },

  error: DeviceNotFound,
}) {}
