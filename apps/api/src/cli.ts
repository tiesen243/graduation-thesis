#!/usr/bin/env bun

import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import * as BunRuntime from '@effect/platform-bun/BunRuntime'
import * as BunServices from '@effect/platform-bun/BunServices'
import { CurrentUser } from '@rozumari/contract/auth/middleware'
import * as Effect from 'effect/Effect'

import { AppModule } from '@/modules/app.module'

const cli = AppModule.createCli({
  persistence: 'drizzle',
  providers: [],
}).pipe(
  Effect.provideService(CurrentUser, {
    userId: 'cli' as UserId,
    userRole: 'admin',
  })
)

BunRuntime.runMain(Effect.provide(cli, BunServices.layer))
