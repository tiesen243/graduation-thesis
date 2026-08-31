#!/usr/bin/env bun

import * as BunRuntime from '@effect/platform-bun/BunRuntime'
import * as BunServices from '@effect/platform-bun/BunServices'
import * as Effect from 'effect/Effect'

import { AppModule } from '@/modules/app.module'

const { cli } = AppModule.create({
  persistence: 'drizzle',
  providers: [],
})

BunRuntime.runMain(Effect.provide(cli, BunServices.layer))
