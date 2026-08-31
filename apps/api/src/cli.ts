#!/usr/bin/env bun

import * as BunRuntime from '@effect/platform-bun/BunRuntime'
import * as BunServices from '@effect/platform-bun/BunServices'
import * as Effect from 'effect/Effect'

import { AppModule } from '@/modules/app.module'
import { env } from '@/shared/env'

const { cli } = AppModule.create({
  persistence: 'drizzle',
  auth: {
    secret: env.AUTH_SECRET,
    providers: [],
  },
})

BunRuntime.runMain(Effect.provide(cli, BunServices.layer))
