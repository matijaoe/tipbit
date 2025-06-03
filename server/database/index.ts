import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.DB_FILE_NAME!,
})

// Private DB instance (not exported)
const _db = drizzle(client, { schema })

export { schema }

export type DatabaseTransaction = Parameters<Parameters<typeof _db.transaction>[0]>[0]

export const getInternalDB = () => {
  return _db
}
