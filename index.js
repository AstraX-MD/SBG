import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pino from 'pino'
import fs from 'fs'
import os from 'os'
import qrcode from 'qrcode'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import dotenv from 'dotenv'
import aliveHtml from './public/alive.html.js'
import db from './lib/database.js'
import { MessageUpsert } from './lib/MessageUpsert.js'
import { loadPlugins } from './lib/loader.js'
import logger from './lib/logger.js'

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

app.get('/', (req, res) => {
  res.send(aliveHtml)
})

app.get('/health', (req, res) => {
  res.send('OK')
})

let botStatus = {
  online: false,
  session: 'Invalid',
  uptime: Date.now(),
  ram: '0%',
  db: 'RAM'
}

app.get('/status', (req, res) => {
  botStatus.ram = `${Math.round((1 - os.freemem() / os.totalmem()) * 100)}%`
  res.json(botStatus)
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

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      botStatus.session = 'Waiting for Scan'
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
      botStatus.online = false
      if (shouldReconnect) startSBG()
    } else if (connection === 'open') {
      botStatus.online = true
      botStatus.session = 'Valid'
      botStatus.db = db.type || 'RAM'
      
      const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      
      if (!db.data.firstConnect) {
        sock.sendMessage(ownerJid, {
          image: { url: db.data.botThumbnail },
          caption: `╭❖『 🤖 ${db.data.botname} CONNECTED 』
│
├❖ *To:* @owner
├❖ *Bot:* ${db.data.botname}
├❖ *Prefix:* ${db.data.prefix}
├❖ *Mode:* ${db.data.mode}
├❖ *Database:* ${db.type}
├❖ *Status:* ✅ Online
├⊸ *Session:* Valid & Secure
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

setInterval(() => {
  const ramUsage = (1 - os.freemem() / os.totalmem()) * 100
  if (ramUsage > MAX_RAM_PERCENT) {
    logger.info('RAM Usage high, cleaning...')
  }
}, 120000)

server.listen(PORT, () => {
  console.log(`SBG Dashboard running on port ${PORT}`)
  startSBG()
})