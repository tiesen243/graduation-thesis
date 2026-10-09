import * as OpenRouterClient from '@effect/ai-openrouter/OpenRouterClient'
import * as OpenRouterLanguageModel from '@effect/ai-openrouter/OpenRouterLanguageModel'
import * as BunHttpClient from '@effect/platform-bun/BunHttpClient'
import * as BunRuntime from '@effect/platform-bun/BunRuntime'
import * as LanguageModel from 'effect/ai/LanguageModel'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import * as Stream from 'effect/Stream'

import { env } from '@/shared/env'

const model = OpenRouterLanguageModel.model('openrouter/free')

const streamingJoke = LanguageModel.streamText({
  concurrency: 'unbounded',
  prompt: 'Tell me a dad joke about programming.',
}).pipe(
  Stream.runForEach((part) =>
    Effect.sync(() => {
      if (part.type === 'text-delta') process.stdout.write(part.delta)
    })
  )
)

const OpenRouter = OpenRouterClient.layer({
  apiKey: Redacted.make(env.OPENROUTER_API_KEY),
}).pipe(Layer.provide(BunHttpClient.layer))

streamingJoke.pipe(
  Effect.provide(model),
  Effect.provide(OpenRouter),
  BunRuntime.runMain
)
