import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

type DbType = ReturnType<typeof createDb>

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  const sql = neon(url)
  return drizzle(sql, { schema })
}

let _db: DbType | null = null

function getDatabase(): DbType {
  if (!_db) {
    _db = createDb()
  }
  return _db
}

export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getDatabase() as any)[prop]
  },
})
