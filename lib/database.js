import dotenv from 'dotenv'
import defaults from './default.js'
dotenv.config()

const db = {
  type: 'RAM',
  data: { ...defaults },
  get(key) { return this.data[key] },
  set(key, val) { this.data[key] = val },
  // Placeholder for persistence
  write: async () => {
    // In RAM mode, this does nothing but prevents crashes
    return true
  },
  addSudo: async (number) => {
    if (!db.data.sudo.includes(number)) {
      db.data.sudo.push(number)
      await db.write()
    }
    return db.data.sudo
  },
  delSudo: async (number) => {
    db.data.sudo = db.data.sudo.filter(n => n !== number)
    await db.write()
    return db.data.sudo
  },
  isSudo: (number) => {
    return db.data.sudo.includes(number) || number === db.data.owner?.split('@')[0]
  }
}

if (process.env.MONGO_URL) db.type = 'MongoDB'
else if (process.env.NEON_URL) db.type = 'Neon'
else if (process.env.SUPABASE_URL) db.type = 'Supabase'
else if (process.env.APPWRITE_URL) db.type = 'Appwrite'
else if (process.env.SQLITE_URL) db.type = 'SQLite'
else if (process.env.MYSQL_URL) db.type = 'MySQL'

export default db
