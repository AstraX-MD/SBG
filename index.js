import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion, makeInMemoryStore } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initDb, db } from './lib/database.js'
import { logger } from './lib/logger.js'
import { initLoader } from './lib/loader.js'
import { routeMessage } from './lib/router.js'
import aliveHtml from './public/alive.html.js'
import statusHtml from './public/status.html.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

global.logger = logger
logger.info('GLOBAL', 'Logger attached to global scope')

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3000

// Initialize Store
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) })
store.readFromFile('./sessions/baileys_store.json')
setInterval(() => {
  store.writeToFile('./sessions/baileys_store.json')
}, 10000)

app.use(express.static(join(__dirname, 'public')))
app.use(express.json())

app.get('/', (req, res) => res.send(aliveHtml))
app.get('/status', (req, res) => res.send(statusHtml))

function loadSessionFromEnv() {
  const sessionId = process.env.SESSION_ID
  if (!sessionId || !sessionId.includes('~')) {
    logger.error('SESSION', 'No SESSION_ID found in env or invalid format')
    return false
  }
  try {
    const SESSION_DIR = db.data.sessionPath || './sessions'
    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })
    const base64Data = sessionId.split('~')[1]
    const decoded = Buffer.from(base64Data, 'base64').toString('utf-8')
    const creds = JSON.parse(decoded)
    fs.writeFileSync(join(SESSION_DIR, 'creds.json'), JSON.stringify(creds, null, 2))
    logger.success('SESSION', `Session loaded from ${sessionId.split('~')[0]}~ prefix`)
    return true
  } catch (e) {
    logger.error('SESSION', 'Failed to decode SESSION_ID', e.message)
    return false
  }
}

async function startBot() {
  logger.bot('STARTUP', 'Starting SBG Bot...')
  await initDb()
  
  const platform = process.env.RENDER ? 'Render' : 
                   process.env.RAILWAY_ENVIRONMENT ? 'Railway' :
                   process.env.DYNO ? 'Heroku' :
                   process.env.FLY_APP_NAME ? 'Fly' :
                   process.env.FIREBASE_CONFIG ? 'Firebase' : 'Local'
  db.data.platform = platform

  logger.success('DB', `Database mode: ${db.type}`)

  const SESSION_DIR = db.data.sessionPath || './sessions'
  const CREDS_PATH = join(SESSION_DIR, 'creds.json')

  if (!fs.existsSync(CREDS_PATH)) {
    if (!loadSessionFromEnv()) {
      logger.error('STARTUP', 'No session found. Exiting.')
      process.exit(1)
    }
  }

  await initLoader()
  const { version } = await fetchLatestBaileysVersion()
  logger.info('BAILEYS', `Using WA v${version.join('.')}`)

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      }
      return { conversation: '' }
    }
  })

  store.bind(sock.ev)

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      logger.error('CONNECTION', `Closed: ${statusCode}`, lastDisconnect?.error?.message)
      if (shouldReconnect) {
        logger.warn('CONNECTION', 'Reconnecting in 10s...')
        setTimeout(() => startBot(), 10000)
      } else {
        logger.error('CONNECTION', 'Logged out. Delete sessions/ and re-pair.')
        process.exit(1)
      }
    } else if (connection === 'open') {
      const botNumber = sock.user.id.split(':')[0].split('@')[0]
      if (!db.data.owner || db.data.owner === '') {
        db.data.owner = botNumber + '@s.whatsapp.net'
        await db.write()
        logger.success('OWNER', `Owner auto-set to: ${botNumber}`)
      }
      
      if (!db.data.antidelete.destination) {
        db.data.antidelete.destination = db.data.owner
        await db.write()
      }

      const botname = db.data.botname
      const prefix = db.data.prefix
      const owner = db.data.owner.split('@')[0]

      logger.connected(sock.user.id, botname)
      logger.banner(botname, prefix, owner, db.data.mode, version.join('.'))

      if (!db.data.firstConnect) {
        await sendConnectedMsg(sock)
        db.data.firstConnect = true
        await db.write()
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const m of messages) {
      const { MessageUpsert } = await import('./lib/MessageUpsert.js')
      await MessageUpsert(sock, db, m)
    }
  })

  sock.ev.on('messages.delete', async (update) => {
    const antidelete = await import('./plugins/events/anti/antidelete.js').catch(() => null)
    if (antidelete) await antidelete.default(sock, db, update)
  })
}

async function sendConnectedMsg(sock) {
  try {
    const owner = db.data.owner
    const msg = `╭❖『 🤖 ${db.data.botname} CONNECTED 』
│
├❖ *To:* @${owner.split('@')[0]}
├❖ *Bot:* ${db.data.botname}
├❖ *Prefix:* ${db.data.prefix}
├❖ *Mode:* ${db.data.mode}
├❖ *Platform:* ${db.data.platform}
├❖ *Status:* ✅ Online
├⊸ *Session:* Valid & Secure
│
╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(owner, { text: msg, mentions: [owner] })
    logger.success('BOT', 'Connected message sent to owner')
  } catch (e) {
    logger.error('BOT', 'Failed to send connected msg', e.message)
  }
}

server.listen(PORT, () => {
  logger.success('SERVER', `Port ${PORT} opened for Render`)
  startBot()
})