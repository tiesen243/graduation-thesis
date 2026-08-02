// oxlint-disable max-classes-per-file

import * as Redacted from 'effect/Redacted'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'

import { AppModule } from '@/modules/app.module'
import { env } from '@/shared/env'

const application = AppModule.create({
  persistentDriver: 'in-memory',
  auth: {
    secret: Redacted.make(env.AUTH_SECRET),
  },
})

export default {
  fetch: HttpRouter.toWebHandler(application).handler,
}
