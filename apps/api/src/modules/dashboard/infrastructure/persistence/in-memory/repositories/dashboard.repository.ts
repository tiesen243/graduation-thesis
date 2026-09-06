// oxlint-disable typescript/no-explicit-any

import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import { DashboardRepository } from '@/modules/dashboard/application/ports/dashboard.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemoryDashboardRepository = Layer.effect(
  DashboardRepository,
  Effect.gen(function* InMemoryDashboardRepository() {
    const { db } = yield* InMemoryClient

    return {
      getData: () =>
        Effect.gen(function* getData() {
          const usersMap = yield* Ref.get(db.users)
          const devicesMap = yield* Ref.get(db.devices)
          const schedulesMap = yield* Ref.get(db.schedules)
          const notificationsMap = yield* Ref.get(db.notifications)

          const totalUsers = usersMap.size
          const totalDevices = devicesMap.size

          let linkedDevices = 0
          for (const device of devicesMap.values())
            if (device.status === 'linked') linkedDevices += 1

          const schedules = { completed: 0, pending: 0, failed: 0 }
          for (const schedule of schedulesMap.values()) {
            if (schedule.status in schedules)
              schedules[schedule.status as keyof typeof schedules] += 1
          }

          const recentAlerts = [...notificationsMap.values()]
            .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)

          return {
            metrics: { totalUsers, totalDevices, linkedDevices, schedules },
            recentAlerts,
          }
        }),

      getDataByUserId: Effect.fn(function* getDataByUserId(userId) {
        const devicesMap = yield* Ref.get(db.devices)
        const schedulesMap = yield* Ref.get(db.schedules)
        const notificationsMap = yield* Ref.get(db.notifications)
        const compartmentsMap = yield* Ref.get(db.compartments)

        const [todayStr] = new Date().toISOString().split('T')

        const userDevicesList: {
          id: any
          factoryModel: any
          status: any
          name: any
          position: any
          activatedAt: any
        }[] = []
        const userDeviceIds = new Set<string>()

        for (const device of devicesMap.values()) {
          if (device.userId === userId) {
            userDeviceIds.add(device.id)
            userDevicesList.push({
              id: device.id,
              factoryModel: device.factoryModel,
              status: device.status,
              name: device.name,
              position: device.position,
              activatedAt: device.activatedAt,
            })
          }
        }

        const todaySchedules = { completed: 0, pending: 0, failed: 0 }
        for (const schedule of schedulesMap.values()) {
          const scheduleDateStr =
            // @ts-expect-error - schedule.date can be a Date or a string, we need to handle both cases
            schedule.date instanceof Date
              ? schedule.date.toISOString().split('T')[0]
              : String(schedule.date).split('T')[0]

          if (
            schedule.userId === userId &&
            scheduleDateStr === todayStr &&
            schedule.status in todaySchedules
          )
            todaySchedules[schedule.status as keyof typeof todaySchedules] += 1
        }

        const recentNotifications = [...notificationsMap.values()]
          .filter((n) => n.userId === userId)
          .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map((n) => ({
            id: n.id,
            level: n.level,
            title: n.title,
            body: n.body,
            createdAt: n.createdAt,
          }))

        const lowStockCompartments: {
          medicine: any
          capacity: any
          position: any
          deviceId: any
        }[] = []

        for (const compartment of compartmentsMap.values()) {
          if (
            userDeviceIds.has(compartment.deviceId) &&
            compartment.capacity < 5
          )
            lowStockCompartments.push({
              medicine: compartment.medicine,
              capacity: compartment.capacity,
              position: compartment.position,
              deviceId: compartment.deviceId,
            })
        }

        return {
          metrics: {
            totalDevices: userDevicesList.length,
            todaySchedules,
            lowStockCount: lowStockCompartments.length,
          },
          devices: userDevicesList,
          recentNotifications,
          lowStockCompartments,
        }
      }),
    }
  })
)
