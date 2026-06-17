import dotenv from 'dotenv'
import defaults from './default.js'
dotenv.config()

export const db = {
  type: 'RAM',
  data: { 
    ...defaults,
    antidelete: {
      enabled: true,
      mode: 'private',
      destination: '',
      disabledChats: [],
      disabledTypes: [],
      disabledUsers: [],
      logDeletes: true,
      maxFileSize: 100,
      antiSpam: true
    }
  },
  get(key) { return this.data[key] },
  async set(key, val) { 
    this.data[key] = val 
    await this.write()
  },
  write: async () => {
    logger.debug('DATABASE', 'Database write success')
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
    const sudoList = db.data.sudo || []
    return sudoList.includes(number) || number === db.data.owner?.split('@')[0]
  }
}

export async function initDb() {
  if (process.env.MONGO_URL) db.type = 'MongoDB'
  else if (process.env.NEON_URL) db.type = 'Neon'
  else if (process.env.SUPABASE_URL) db.type = 'Supabase'
  else if (process.env.APPWRITE_URL) db.type = 'Appwrite'
  else if (process.env.SQLITE_URL) db.type = 'SQLite'
  else if (process.env.MYSQL_URL) db.type = 'MySQL'
  
  logger.info('DATABASE', `Connected in ${db.type} mode`)
}

export default db