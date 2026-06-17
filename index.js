import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import os from 'os'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import dotenv from 'dotenv'
import aliveHtml from './public/alive.html.js'
import statusHtml from './public/status.html.js'
import db from './lib/database.js'
import { MessageUpsert } from './lib/MessageUpsert.js'
import { loadPlugins } from './lib/loader.js'
import logger, { cmdStats } from './lib/logger.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BASE_SESSION_DIR = './sbg_session'
const MAX_RAM_PERCENT = 75

const app = express()
const server = createServer(app)
const io = new Server(server)
const PORT = process.env.PORT || 10000

app.use(express.static(join(__dirname, 'public')))
app.use(express.json())

app.get('/', (req, res) => {
  res.send(aliveHtml)
})

app.get('/status', (req, res) => {
  res.send(statusHtml(db.data))
})

// API Endpoints
app.get('/api/stats', (req, res) => {
  res.json({
    ...cmdStats,
    totalCommands: global.commands?.size || 0
  })
})

app.get('/api/info', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: db.data.platform,
    os: {
      total: os.totalmem(),
      free: os.freemem()
    }
  })
})

app.post('/api/update', async (req, res) => {
  const { field, value } = req.body
  // Simple check - in production you'd use a secret key or session
  if (field in db.data) {
    db.data[field] = value
    await db.write()
    res.json({ success: true })
  } else {
    res.status(400).json({ success: false, error: 'Invalid field' })
  }
})

async function startSBG() {
  const { state, saveCreds } = await useMultiFileAuthState(BASE_SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: logger,
    printQRInTerminal: true,
    auth: state,
    browser: Browsers.ubuntu('Chrome')
  })

  await loadPlugins()

  // Dynamic Platform Detection
  let platform = 'Katabump/Pterodactyl'
  if (process.env.RENDER) platform = 'Render'
  else if (process.env.RAILWAY_ENVIRONMENT) platform = 'Railway'
  else if (process.env.DYNO) platform = 'Heroku'
  else if (process.env.FLY_APP_NAME) platform = 'Fly'
  else if (process.env.FIREBASE_CONFIG) platform = 'Firebase'
  
  db.data.platform = platform

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startSBG()
    } else if (connection === 'open') {
      const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      if (!db.data.firstConnect) {
        sock.sendMessage(ownerJid, {
          image: { url: db.data.botThumbnail },
          caption: `╭❖『 🤖 ${db.data.botname} CONNECTED 』
│
├❖ *Bot:* ${db.data.botname}
├❖ *Prefix:* ${db.data.prefix}
├❖ *Mode:* ${db.data.mode}
├❖ *Platform:* ${db.data.platform}
├❖ *Status:* ✅ Online
│
╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
        })
        db.data.firstConnect = true
      }
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    await MessageUpsert(sock, db, m)
  })
}

server.listen(PORT, () => {
  console.log(`SBG Dashboard running on port ${PORT}`)
  startSBG()
})
