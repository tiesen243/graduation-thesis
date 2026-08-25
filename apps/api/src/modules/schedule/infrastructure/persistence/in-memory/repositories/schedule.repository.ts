import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import type { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'

import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'
import { formatToday } from '@/modules/schedule/domain/utils/format-today'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

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
      (entity) => `${entity.scheduleId}:${entity.slot}`
    )

    const mapSchedulesWithItems = Effect.fn(function* mapSchedulesWithItems(
      schedules: Schedule[]
    ) {
      if (schedules.length === 0) return []

      const scheduleIds = new Set(schedules.map((s) => s.id))
      const allItems = yield* itemsRepo.findMany({
        where: { scheduleId: { in: [...scheduleIds] } },
      })

      const itemsBySchedule = Map.groupBy(allItems, (item) => item.scheduleId)

      return schedules.map((schedule) => ({
        schedule,
        items: itemsBySchedule.get(schedule.id) ?? [],
      })) as ScheduleRepository.WithItems[]
    })

    return {
      ...schedulesRepo,

      findWithItems: Effect.fn(function* findWithItems(scheduleId) {
        const [schedule] = yield* schedulesRepo.findMany({
          where: { id: { eq: scheduleId } },
          limit: 1,
        })
        if (!schedule) return null

        const [result] = yield* mapSchedulesWithItems([schedule])
        return result ?? null
      }),

      findByDevice: Effect.fn(function* findByDevice(deviceId: DeviceId) {
        const schedules = yield* schedulesRepo.findMany({
          where: { deviceId: { eq: deviceId } },
        })

        return yield* mapSchedulesWithItems(schedules)
      }),

      findManyWithItems: Effect.fn(function* findManyWithItems({
        userId,
        deviceId,
        limit,
        offset,
      }) {
        const schedules = yield* schedulesRepo.findMany({
          where: deviceId
            ? { userId: { eq: userId }, deviceId: { eq: deviceId } }
            : { userId: { eq: userId } },
          limit,
          offset,
        })

        return yield* mapSchedulesWithItems(schedules)
      }),

      saveWithItems: Effect.fn(function* saveWithItems(schedule, items) {
        yield* schedulesRepo.save(schedule)
        yield* itemsRepo.save(items)
      }),

      findTodayByDevice: Effect.fn(function* findTodayByDevice(deviceId) {
        const today = formatToday()
        const schedules = yield* schedulesRepo.findMany({
          where: { deviceId: { eq: deviceId }, date: { eq: today } },
        })

        return yield* mapSchedulesWithItems(schedules)
      }),

      deleteWithItems: Effect.fn(function* deleteWithItems(scheduleId) {
        const items = yield* itemsRepo.findMany({
          where: { scheduleId: { eq: scheduleId } },
        })
        if (items.length > 0)
          // oxlint-disable-next-line unicorn/no-array-method-this-argument unicorn/no-array-for-each
          yield* Effect.forEach(items, (item) => itemsRepo.delete(item))

        const [schedule] = yield* schedulesRepo.findMany({
          where: { id: { eq: scheduleId } },
          limit: 1,
        })
        if (schedule) yield* schedulesRepo.delete(schedule)
      }),
    }
  })
)
