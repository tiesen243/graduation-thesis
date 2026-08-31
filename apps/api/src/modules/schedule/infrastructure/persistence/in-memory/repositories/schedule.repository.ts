import type { ScheduleAggregate } from '@rozumari/contract/schedule/schemas/schedule.aggregate'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import type { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'

import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'
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

      const compartmentsMap = yield* Ref.get(db.compartments)

      const itemsBySchedule = Map.groupBy(allItems, (item) => item.scheduleId)

      return schedules.map((schedule) => {
        const scheduleItemsList = itemsBySchedule.get(schedule.id) ?? []

        const items = scheduleItemsList.map((item) => {
          const compartmentKey = `${schedule.deviceId}:${item.slot}`
          const compartment = compartmentsMap.get(compartmentKey)

          return {
            slot: item.slot,
            quantity: item.quantity,
            medicine: compartment?.medicine ?? '',
          }
        })

        return {
          ...schedule,
          items,
        } as ScheduleAggregate
      })
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

      findManyWithItems: Effect.fn(function* findManyWithItems({
        userId,
        deviceId,
        startDate,
        endDate,
      }) {
        const schedules = yield* Ref.get(db.schedules).pipe(
          Effect.map((dict) => [...dict.values()])
        )

        const filteredSchedules = schedules.filter((schedule) => {
          if (userId && schedule.userId !== userId) return false
          if (deviceId && schedule.deviceId !== deviceId) return false

          const scheduleDate = schedule.date

          if (startDate === endDate) return scheduleDate === startDate

          return scheduleDate >= startDate && scheduleDate <= endDate
        })

        return yield* mapSchedulesWithItems(filteredSchedules)
      }),
    }
  })
)
