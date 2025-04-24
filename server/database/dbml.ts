// dbml.ts
import { schema } from './index'
import { pgGenerate } from 'drizzle-dbml-generator'

const out = './server/database/schema.dbml'
const relational = true
pgGenerate({ schema, out, relational })

console.log('✅ Created the schema.dbml file')
console.log('⏳ Creating the erd.svg file')
