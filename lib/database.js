import dotenv from 'dotenv'
import defaults from './default.js'
dotenv.config()

const db = {
  type: 'RAM',
  data: { ...defaults },
  get(key) { return this.data[key] },
  set(key, val) { this.data[key] = val }
}

if (process.env.MONGO_URL) db.type = 'MongoDB'
else if (process.env.NEON_URL) db.type = 'Neon'
else if (process.env.SUPABASE_URL) db.type = 'Supabase'
else if (process.env.APPWRITE_URL) db.type = 'Appwrite'
else if (process.env.SQLITE_URL) db.type = 'SQLite'
else if (process.env.MYSQL_URL) db.type = 'MySQL'

export default db