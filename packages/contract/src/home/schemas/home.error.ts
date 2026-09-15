import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class NotFound extends Schema.TaggedError<NotFound>()(
  'home/domain/NotFound',
  ApiResponse({
    status: 404,
    message: 'The requested resource was not found',
  }),
  { httpApiStatus: 404 }
) {}
