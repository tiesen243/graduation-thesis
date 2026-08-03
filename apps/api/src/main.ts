// oxlint-disable max-classes-per-file

import * as Redacted from 'effect/Redacted'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'

import { AppModule } from '@/modules/app.module'
import { GoogleProvider } from '@/modules/auth/infrastructure/oauth/providers/google.provider'
import { env } from '@/shared/env'

const application = AppModule.create({
  persistentDriver: 'drizzle',
  auth: {
    secret: Redacted.make(env.AUTH_SECRET),
    providers: [new GoogleProvider(env.AUTH_GOOGLE_ID, env.AUTH_GOOGLE_SECRET)],
  },
})

export default {
  fetch: HttpRouter.toWebHandler(application).handler,
}
