import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import { Schedule, ScheduleItem } from '@/modules/schedule/domain/entities/schedule.entity'
import {
  ScheduleRepository,
  type ScheduleWithItems,
} from '@/modules/schedule/domain/repositories/schedule.repository'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

const DAY_OF_WEEK = () => new Date().getDay()

export const InMemoryScheduleRepository = Layer.effect(
  ScheduleRepository,
  Effect.gen(function* InMemoryScheduleRepository() {
    const { db } = yield* InMemoryClient

    const schedulesRepo = yield* makeInMemoryRepository<Schedule, ScheduleId>(
      db.schedules,
      (entity) => entity.id
    )
    const itemsRepo = yield* makeInMemoryRepository<ScheduleItem, string>(
      db.scheduleItems,
      (entity) => entity.id
    )

    const withItemsFor = Effect.fn(function* withItemsFor(
      schedule: Schedule
    ): Effect.Effect<ScheduleWithItems> {
      const items = yield* itemsRepo.findMany({
        where: { scheduleId: { eq: schedule.id } },
      })
      return { schedule, items }
    })

    return {
      findMany: schedulesRepo.findMany,

      count: schedulesRepo.count,

      findWithItems: Effect.fn(function* findWithItems(scheduleId) {
        const [schedule] = yield* schedulesRepo.findMany({
          where: { id: { eq: scheduleId } },
          limit: 1,
        })
        if (!schedule) return null
        return yield* withItemsFor(schedule)
      }),

      findByDevice: Effect.fn(function* findByDevice(deviceId: DeviceId) {
        const schedules = yield* schedulesRepo.findMany({
          where: { deviceId: { eq: deviceId } },
        })
        return yield* Effect.forEach(schedules, withItemsFor, {
          concurrency: 'unbounded',
        })
      }),

      saveWithItems: Effect.fn(function* saveWithItems(schedule, items) {
        yield* schedulesRepo.save(schedule)
        yield* itemsRepo.save(items)
      }),

      findTodayByDevice: Effect.fn(function* findTodayByDevice(deviceId) {
        const today = DAY_OF_WEEK()
        const schedules = yield* schedulesRepo.findMany({
          where: { deviceId: { eq: deviceId } },
        })
        const todays = schedules.filter((s) =>
          s.daysOfWeek.includes(today)
        )
        return yield* Effect.forEach(todays, withItemsFor, {
          concurrency: 'unbounded',
        })
      }),

      deleteWithItems: Effect.fn(function* deleteWithItems(scheduleId) {
        const [schedule] = yield* schedulesRepo.findMany({
          where: { id: { eq: scheduleId } },
          limit: 1,
        })
        if (schedule) yield* schedulesRepo.delete(schedule)

        const items = yield* itemsRepo.findMany({
          where: { scheduleId: { eq: scheduleId } },
        })
        for (const item of items) yield* itemsRepo.delete(item)
      }),
    }
  })
)
