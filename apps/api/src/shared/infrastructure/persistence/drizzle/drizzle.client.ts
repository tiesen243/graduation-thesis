import type { PgAsyncTransaction } from 'drizzle-orm/pg-core'
import type {
  PostgresJsDatabase,
  PostgresJsQueryResultHKT,
} from 'drizzle-orm/postgres-js'

import { drizzle } from 'drizzle-orm/postgres-js'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import postgres from 'postgres'

import { Http } from '@/shared/http'
import { env } from '@/shared/lib/env'

const createDrizzleClient = () => {
  const client = postgres(env.DATABASE_URL)
  return drizzle({ client })
}

const globalForDrizzleClient = globalThis as unknown as {
  client: ReturnType<typeof createDrizzleClient> | undefined
}
export const db = globalForDrizzleClient.client ?? createDrizzleClient()
if (process.env.NODE_ENV !== 'production') globalForDrizzleClient.client = db

type Client = PostgresJsDatabase | PgAsyncTransaction<PostgresJsQueryResultHKT>
type DrizzleClientReturn = <A>(
  query: (client: Client) => PromiseLike<A>
) => Effect.Effect<A, Http>

export class DrizzleClient extends Context.Tag(
  'shared/infrastructure/persistence/drizzle/DrizzleClient'
)<DrizzleClient, DrizzleClientReturn>() {
  public static make =
    (client: Client = db): DrizzleClientReturn =>
    <A>(query: (client: Client) => PromiseLike<A>) =>
      Effect.tryPromise({
        try: () => query(client),
        catch: (error) =>
          Http.internalServerError(`DrizzleClient error: ${error}`),
      })

  public static live = Layer.succeed(this, this.make())
}
