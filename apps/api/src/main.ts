// oxlint-disable max-classes-per-file

import * as Redacted from 'effect/Redacted'
import * as HttpRouter from 'effect/unstable/http/HttpRouter'

import { AppModule } from '@/modules/app.module'
import { env } from '@/shared/env'

const application = AppModule.create({
  persistentDriver: 'drizzle',
  auth: {
    secret: Redacted.make(env.AUTH_SECRET),
  },
})

export default {
  fetch: HttpRouter.toWebHandler(application).handler,

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
}
