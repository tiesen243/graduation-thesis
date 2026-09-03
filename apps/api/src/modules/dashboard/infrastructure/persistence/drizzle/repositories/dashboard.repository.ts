import { DeviceStatus } from '@rozumari/contract/device/schemas/device.schema'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DashboardRepository } from '@/modules/dashboard/application/ports/dashboard.repository'
import {
  compartments,
  devices,
} from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { notifications } from '@/modules/notification/infrastructure/persistence/drizzle/schema'
import { schedules } from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const DrizzleDashboardRepository = Layer.effect(
  DashboardRepository,
  Effect.gen(function* DrizzleDashboardRepository() {
    const { db } = yield* DrizzleClient

    return {
      getData: () =>
        Effect.gen(function* getData() {
          const [
            totalUsers,
            totalDevices,
            linkedDevices,
            scheduleStats,
            recentAlerts,
          ] = yield* Effect.all(
            [
              db.$count(users),
              db.$count(devices),
              db.$count(
                devices,
                eq(devices.status, DeviceStatus.make('linked'))
              ),
              db
                .select({ status: schedules.status, count: count() })
                .from(schedules)
                .groupBy(schedules.status),
              db
                .select()
                .from(notifications)
                .orderBy(desc(notifications.createdAt))
                .limit(5),
            ],
            { concurrency: 'unbounded' }
          ).pipe(Effect.orDie)

          return {
            metrics: {
              totalUsers,
              totalDevices,
              linkedDevices,
              schedules: {
                completed:
                  scheduleStats.find((s) => s.status === 'completed')?.count ??
                  0,
                pending:
                  scheduleStats.find((s) => s.status === 'pending')?.count ?? 0,
                failed:
                  scheduleStats.find((s) => s.status === 'failed')?.count ?? 0,
              },
            },
            recentAlerts,
          }
        }),

      getDataByUserId: Effect.fn(function* getDataByUserId(userId) {
        const [
          userDevices,
          scheduleTodayStats,
          recentNotifications,
          lowStockCompartments,
        ] = yield* Effect.all(
          [
            db
              .select({
                id: devices.id,
                factoryModel: devices.factoryModel,
                status: devices.status,
                name: devices.name,
                position: devices.position,
                activatedAt: devices.activatedAt,
              })
              .from(devices)
              .where(eq(devices.userId, userId)),

            db
              .select({
                status: schedules.status,
                count: count(),
              })
              .from(schedules)
              .where(
                and(
                  eq(schedules.userId, userId),
                  eq(schedules.date, sql`CURRENT_DATE`)
                )
              )
              .groupBy(schedules.status),

            db
              .select({
                id: notifications.id,
                level: notifications.level,
                title: notifications.title,
                body: notifications.body,
                createdAt: notifications.createdAt,
              })
              .from(notifications)
              .where(eq(notifications.userId, userId))
              .orderBy(desc(notifications.createdAt))
              .limit(5),

            db
              .select({
                medicine: compartments.medicine,
                capacity: compartments.capacity,
                position: compartments.position,
                deviceId: compartments.deviceId,
              })
              .from(compartments)
              .innerJoin(devices, eq(compartments.deviceId, devices.id))
              .where(
                and(
                  eq(devices.userId, userId),
                  sql`${compartments.capacity} < 5`
                )
              ),
          ],
          { concurrency: 'unbounded' }
        ).pipe(Effect.orDie)

        return {
          metrics: {
            totalDevices: userDevices.length,
            todaySchedules: {
              completed:
                scheduleTodayStats.find((s) => s.status === 'completed')
                  ?.count ?? 0,
              pending:
                scheduleTodayStats.find((s) => s.status === 'pending')?.count ??
                0,
              failed:
                scheduleTodayStats.find((s) => s.status === 'failed')?.count ??
                0,
            },
            lowStockCount: lowStockCompartments.length,
          },
          devices: userDevices,
          recentNotifications,
          lowStockCompartments,
        }
      }),
    }
  })
)
