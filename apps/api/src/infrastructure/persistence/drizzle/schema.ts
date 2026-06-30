import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

const id = varchar({ length: 24 }).primaryKey()
const createdAt = timestamp({ mode: 'date' }).defaultNow()
const updatedAt = timestamp({ mode: 'date' })
  .defaultNow()
  .$onUpdate(() => new Date())
const deletedAt = timestamp({ mode: 'date' })

export const userRoles = pgEnum('user_roles', ['ADMIN', 'USER'])
export const deviceStatuses = pgEnum('device_statuses', [
  'LINKED',
  'UNLINKED',
  'SUSPENDED',
])
export const trackingStatuses = pgEnum('tracking_statuses', [
  'PENDING',
  'TAKEN',
  'MISSED',
  'SKIPPED',
])
export const subscriptionStatuses = pgEnum('subscription_statuses', [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
])

export const users = pgTable(
  'users',
  {
    id,
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: 'date' }),
    username: varchar({ length: 20 }).notNull(),
    role: userRoles().default('USER').notNull(),
    image: varchar({ length: 255 }),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (t) => [
    uniqueIndex('users_email_uq_idx').on(t.email),
    uniqueIndex('users_username_uq_idx').on(t.username),
  ]
)

export const accounts = pgTable(
  'accounts',
  {
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }),

    userId: varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
)

export const sessions = pgTable(
  'sessions',
  {
    id,
    token: varchar({ length: 64 }).notNull(),
    expiresAt: timestamp({ mode: 'date' }).notNull(),
    createdAt,

    userId: varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('sessions_token_uq_idx').on(t.token)]
)

export const devices = pgTable(
  'devices',
  {
    id,
    factoryModel: varchar({ length: 255 }).notNull(),
    status: deviceStatuses().default('UNLINKED').notNull(),
    name: varchar({ length: 255 }),
    position: varchar({ length: 255 }),
    activatedAt: timestamp({ mode: 'date' }),
    createdAt,
    updatedAt,

    userId: varchar({ length: 24 }).references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [index('devices_user_id_idx').on(t.userId)]
)

export const compartments = pgTable(
  'compartments',
  {
    id,
    medicine: varchar({ length: 255 }).notNull(),
    capacity: integer().default(0).notNull(),
    maxCapacity: integer().default(0).notNull(),
    position: varchar({ length: 4 }).notNull(), // position in the pill box (x, y). E.g. "1,1" for the first row and first column
    lastRefillAt: timestamp({ mode: 'date' }),

    boxId: varchar({ length: 24 })
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('compartments_box_id_position_uq_idx').on(t.boxId, t.position),
  ]
)

export const patients = pgTable(
  'patients',
  {
    id,
    name: varchar({ length: 255 }).notNull(),
    dateOfBirth: timestamp({ mode: 'date' }),
    gender: varchar({ length: 10 }),
    medicalHistory: text(),
    note: text(),
    createdAt,
    updatedAt,

    userId: varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceId: varchar({ length: 24 }).references(() => devices.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [
    index('patients_user_id_idx').on(t.userId),
    index('patients_device_id_idx').on(t.deviceId),
  ]
)

export const schedules = pgTable(
  'schedules',
  {
    id,
    title: varchar({ length: 255 }).notNull(),
    description: text(),

    startedAt: timestamp({ mode: 'date' }).notNull(),
    endedAt: timestamp({ mode: 'date' }).notNull(),
    daysOfWeek: varchar({ length: 7 }).notNull(), // e.g. "1111100" for Mon-Fri
    timeOfDay: varchar({ length: 5 }).notNull(), // e.g. "08:00" for 8 AM, "20:30" for 8:30 PM
    dosage: integer().default(1).notNull(),

    patientId: varchar({ length: 24 })
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    compartmentId: varchar({ length: 24 })
      .notNull()
      .references(() => compartments.id, { onDelete: 'cascade' }),
  },
  (t) => [
    index('schedules_patient_id_idx').on(t.patientId),
    index('schedules_duration_idx').on(t.startedAt, t.endedAt),
  ]
)

export const trackings = pgTable(
  'trackings',
  {
    id,
    date: date().notNull(),
    status: trackingStatuses().default('PENDING').notNull(),
    takenAt: timestamp({ mode: 'date' }),

    scheduleId: varchar({ length: 24 })
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('trackings_schedule_id_date_uq_idx').on(t.scheduleId, t.date),
    index('trackings_date_idx').on(t.date),
  ]
)

export const notifications = pgTable(
  'notifications',
  {
    id,
    title: varchar({ length: 255 }).notNull(),
    message: text().notNull(),
    isRead: integer().default(0).notNull(), // 0 = unread, 1 = read
    createdAt,

    userId: varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [index('notifications_user_id_idx').on(t.userId)]
)

export const subscriptions = pgTable(
  'subscriptions',
  {
    id,
    plan: varchar({ length: 255 }).notNull(),
    status: subscriptionStatuses().default('ACTIVE').notNull(),
    startedAt: timestamp({ mode: 'date' }).notNull(),
    nextBillingDate: timestamp({ mode: 'date' }).notNull(),
    createdAt,
    updatedAt,

    userId: varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceId: varchar({ length: 24 })
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
  },
  (t) => [
    index('subscriptions_next_billing_date_idx').on(t.nextBillingDate),
    index('subscriptions_user_id_device_id_idx').on(t.userId, t.deviceId),
  ]
)

export const invoices = pgTable(
  'invoices',
  {
    id,
    code: varchar({ length: 10 }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    paid: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt,
    updatedAt,

    subscriptionId: varchar({ length: 24 }).references(() => subscriptions.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [
    uniqueIndex('invoices_code_uq_idx').on(t.code),
    index('invoices_subscription_id_idx').on(t.subscriptionId),
  ]
)

export const transactions = pgTable(
  'transactions',
  {
    id: integer().primaryKey(),
    gateway: varchar({ length: 100 }).notNull(),
    transactionDate: timestamp({ mode: 'date' }).notNull(),
    accountNumber: varchar({ length: 20 }).notNull(),
    code: varchar({ length: 20 }),
    content: text(),
    transferType: varchar({ length: 4 }).notNull(),
    description: text(),
    transferAmount: numeric({ precision: 10, scale: 2 }).notNull(),
    referenceCode: varchar({ length: 20 }),

    invoiceId: varchar({ length: 24 }).references(() => invoices.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [index('transactions_invoice_id_idx').on(t.invoiceId)]
)
