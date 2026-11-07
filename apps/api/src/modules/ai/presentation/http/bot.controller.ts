import { Schema } from 'effect'
import * as Effect from 'effect/Effect'
import { HttpRouter, HttpServerResponse } from 'effect/http'
import * as HttpServerRequest from 'effect/http/HttpServerRequest'

import { bot } from '@/modules/ai/infrastructure/services/bot'

type Platform = keyof typeof bot.webhooks

const handlerReq = Effect.fn(function* BotControllerHandler(
  _req: HttpServerRequest.HttpServerRequest
) {
  const { platform } = yield* HttpRouter.schemaParams(
    Schema.Struct({ platform: Schema.String })
  )

  const handler = bot.webhooks[platform as Platform]
  const req = yield* HttpServerRequest.toWeb(_req)

  const res = yield* Effect.promise(() => handler(req))
  return HttpServerResponse.fromWeb(res)
})

export const BotController = HttpRouter.addAll([
  HttpRouter.route('GET', '/api/webhooks/:platform', handlerReq),
  HttpRouter.route('POST', '/api/webhooks/:platform', handlerReq),
])
