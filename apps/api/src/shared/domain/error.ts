import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'

import { ApiResponseSchema } from '@/shared/schema'

export class NotFound extends Schema.TaggedErrorClass<NotFound>()(
  'shared/domain/NotFound',
  ApiResponseSchema(Schema.Null).pipe(
    Schema.fieldsAssign({
      status: Schema.Number.pipe(
        Schema.withConstructorDefault(Effect.succeed(404))
      ),
      message: Schema.String.pipe(
        Schema.withConstructorDefault(
          Effect.succeed('The requested resource was not found')
        )
      ),
    })
  ),
  { httpApiStatus: 404 }
) {
  public static response = HttpServerResponse.json(new this(), { status: 404 })
}
